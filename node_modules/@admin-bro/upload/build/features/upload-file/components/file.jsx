"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
// eslint-disable-next-line import/no-extraneous-dependencies
const design_system_1 = require("@admin-bro/design-system");
const mime_types_type_1 = require("../mime-types.type");
const File = ({ width, record, property }) => {
    const { custom } = property;
    const path = record === null || record === void 0 ? void 0 : record.params[custom.filePathProperty];
    if (!path) {
        return null;
    }
    const name = custom.fileNameProperty
        ? record === null || record === void 0 ? void 0 : record.params[custom.fileNameProperty] : record === null || record === void 0 ? void 0 : record.params[custom.keyProperty];
    const mimeType = custom.mimeTypeProperty && (record === null || record === void 0 ? void 0 : record.params[custom.mimeTypeProperty]);
    if (path && path.length) {
        if (mimeType && mime_types_type_1.ImageMimeTypes.includes(mimeType)) {
            return <img src={path} style={{ maxHeight: width, maxWidth: width }} alt={name}/>;
        }
        if (mimeType && mime_types_type_1.AudioMimeTypes.includes(mimeType)) {
            return (<audio controls src={path}>
          Your browser does not support the
          <code>audio</code>
          <track kind="captions"/>
        </audio>);
        }
    }
    return (<design_system_1.Box>
      <design_system_1.Button as="a" href={path} ml="default" size="sm" rounded target="_blank">
        <design_system_1.Icon icon="DocumentDownload" color="white" mr="default"/>
        {name}
      </design_system_1.Button>
    </design_system_1.Box>);
};
exports.default = File;
