"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const chai_1 = __importStar(require("chai"));
const sinon_1 = __importStar(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const admin_bro_1 = require("admin-bro");
const upload_file_feature_1 = __importDefault(require("./upload-file.feature"));
const stub_provider_1 = __importDefault(require("./spec/stub-provider"));
chai_1.default.use(sinon_chai_1.default);
describe('uploadFileFeature', () => {
    let provider;
    let recordStub;
    let properties;
    let expectedKey;
    const resolvedS3Path = 'resolvedS3Path';
    const filePath = path_1.default.join(__dirname, 'spec/file-fixture.txt');
    const File = {
        name: 'some-name.pdf',
        path: filePath,
        size: 111,
        type: 'txt',
    };
    beforeEach(() => {
        provider = stub_provider_1.default(resolvedS3Path);
        properties = {
            key: 's3Key',
            filePath: 'resolvedPath',
        };
        recordStub = sinon_1.createStubInstance(admin_bro_1.BaseRecord, {
            id: sinon_1.default.stub().returns('1'),
            isValid: sinon_1.default.stub().returns(true),
            update: sinon_1.default.stub().returnsThis(),
        });
        recordStub.params = {};
        expectedKey = `${recordStub.id()}/file-fixture.txt`;
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    describe('constructor', () => {
        it('throws an error when provider was not been given', () => {
            chai_1.expect(() => upload_file_feature_1.default({})).to.throw('You have to specify provider in options');
        });
        it('throws an error when provider was not been given', () => {
            const options = { provider, properties: {} };
            chai_1.expect(() => upload_file_feature_1.default(options)).to.throw('You have to define `key` property in options');
        });
    });
    describe('show#after hook - #fillPath', () => {
        const key = 'someKeyValue';
        const getAfterHook = (options) => {
            var _a, _b, _c;
            const feature = upload_file_feature_1.default(options)({});
            return (_c = (_b = (_a = feature.actions) === null || _a === void 0 ? void 0 : _a.show) === null || _b === void 0 ? void 0 : _b.after) === null || _c === void 0 ? void 0 : _c[0];
        };
        it('fills record with the path', async () => {
            const response = { record: { params: {
                        [properties.key]: key,
                    } } };
            const fillPath = getAfterHook({ provider, properties });
            const ret = await fillPath(response, {}, {});
            chai_1.expect(provider.path).to.have.been.calledWith(key, provider.bucket);
            chai_1.expect(ret.record.params[properties.filePath]).to.equal(resolvedS3Path);
        });
        it('gets bucket from the record when it is present', async () => {
            const bucket = 'some-other-bucket';
            properties.bucket = 'storedBucketProperty';
            const response = { record: { params: {
                        [properties.key]: key,
                        [properties.bucket]: bucket,
                    } } };
            const fillPath = getAfterHook({ provider, properties });
            await fillPath(response, {}, {});
            chai_1.expect(provider.path).to.have.been.calledWith(key, bucket);
        });
        it('does nothing when path is not present', async () => {
            const response = { record: { params: {
                        name: 'some value',
                    } } };
            const fillPath = getAfterHook({ provider, properties });
            const ret = await fillPath(response, {}, {});
            chai_1.expect(ret).to.deep.eq(response);
            chai_1.expect(provider.path).to.not.have.been.called;
        });
    });
    describe('edit#after hook - #updateRecord', () => {
        let response;
        const getAfterHook = (options) => {
            var _a, _b, _c;
            const feature = upload_file_feature_1.default(options)({});
            return (_c = (_b = (_a = feature.actions) === null || _a === void 0 ? void 0 : _a.edit) === null || _b === void 0 ? void 0 : _b.after) === null || _c === void 0 ? void 0 : _c[0];
        };
        beforeEach(() => {
            response = { record: { params: {
                        name: 'some value',
                    } } };
        });
        it('does nothing when request is get', async () => {
            const updateRecord = getAfterHook({ provider, properties });
            const ret = await updateRecord(response, { method: 'get', record: recordStub }, {});
            chai_1.expect(ret).to.deep.eq(response);
        });
        context('property.file is set in the contest', () => {
            let updateRecord;
            let context;
            const request = { method: 'post' };
            beforeEach(() => {
                properties.file = 'uploadedFile';
                properties.bucket = 'bucketProp';
                properties.size = 'sizeProp';
                properties.mimeType = 'mimeTypeProp';
                properties.filename = 'filenameProp';
                File.name = expectedKey;
                context = { [properties.file]: File, record: recordStub };
                updateRecord = getAfterHook({ provider, properties });
            });
            it('uploads file with adapter', async () => {
                await updateRecord(response, request, context);
                chai_1.expect(provider.upload).to.have.been.calledWith(File);
            });
            it('updates all fields in the record', async () => {
                await updateRecord(response, request, context);
                chai_1.expect(recordStub.update).to.have.been.calledWith(sinon_1.default.match({
                    [properties.key]: expectedKey,
                    [properties.bucket]: provider.bucket,
                    [properties.size]: File.size.toString(),
                    [properties.mimeType]: File.type,
                    [properties.filename]: File.name,
                }));
            });
            it('does not delete any old file if there were not file before', async () => {
                await updateRecord(response, request, context);
                chai_1.expect(provider.delete).not.to.have.been.called;
            });
            it('removes old file when there was file before', async () => {
                const oldKey = 'some-old-key.txt';
                const oldBucket = 'oldBucket';
                recordStub.params[properties.key] = oldKey;
                recordStub.params[properties.bucket] = oldBucket;
                await updateRecord(response, request, context);
                chai_1.expect(provider.delete).to.have.been.calledWith(oldKey, oldBucket);
            });
            it('does not remove old file when it had the same key', async () => {
                recordStub.params[properties.key] = expectedKey;
                await updateRecord(response, request, context);
                chai_1.expect(provider.delete).not.to.have.been.called;
            });
            it('removes old file when property.file is set to null', async () => {
                recordStub.params[properties.key] = expectedKey;
                context[properties.file] = null;
                await updateRecord(response, request, context);
                chai_1.expect(provider.upload).not.to.have.been.called;
                chai_1.expect(provider.delete).to.have.been.calledWith(expectedKey, provider.bucket);
                chai_1.expect(recordStub.update).to.have.been.calledWith(sinon_1.default.match({
                    [properties.key]: null,
                    [properties.bucket]: null,
                    [properties.size]: null,
                    [properties.mimeType]: null,
                    [properties.filename]: null,
                }));
            });
        });
    });
});
