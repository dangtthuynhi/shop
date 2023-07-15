"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.StyledBackButton = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactRouterDom = require("react-router-dom");

var _designSystem = require("@adminjs/design-system");

var _allowOverride = _interopRequireDefault(require("../../../hoc/allow-override"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledLink = (0, _styledComponents.default)(({
  rounded,
  ...rest
}) => /*#__PURE__*/_react.default.createElement(_reactRouterDom.Link, rest)).withConfig({
  displayName: "styled-back-button__StyledLink",
  componentId: "sc-pn0p1u-0"
})(["", ""], _designSystem.ButtonCSS);

const StyledBackButton = props => {
  const {
    showInDrawer
  } = props;
  const cssCloseIcon = showInDrawer ? 'ChevronRight' : 'ChevronLeft';
  const navigate = (0, _reactRouterDom.useNavigate)();
  return /*#__PURE__*/_react.default.createElement(StyledLink, {
    size: "icon",
    to: navigate(-1),
    rounded: true,
    mr: "lg",
    type: "button"
  }, /*#__PURE__*/_react.default.createElement(_designSystem.Icon, {
    icon: cssCloseIcon
  }));
};

const OverridableStyledBackButton = (0, _allowOverride.default)(StyledBackButton, 'StyledBackButton');
exports.StyledBackButton = exports.default = OverridableStyledBackButton;