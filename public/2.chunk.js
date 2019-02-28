webpackJsonpac__name_([2],{

/***/ "./src/app/login/login.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var LoginService_1 = __webpack_require__("./src/app/services/LoginService.ts");
var Login = (function () {
    function Login(_loginService, router) {
        this._loginService = _loginService;
        this.router = router;
    }
    Login.prototype.rerouteToOpening = function () {
        this.router.navigate(["/opening"]);
    };
    Login.prototype.login = function () {
        var _this = this;
        this.errorMessage = "";
        console.log(this.userName);
        if (this.userName !== undefined && this.userName != "" && this.userName.trim().length != 0) {
            if (this.userPassword !== undefined && this.userPassword != "" && this.userPassword.trim().length != 0) {
                this._loginService.login(this.userName, this.userPassword).subscribe(function (response) {
                    console.log(response);
                    if (response.code == 200 && response.data.userRole == 3) {
                        _this.userModel = response.data;
                        _this.userLocal = response.data._id;
                        localStorage.setItem("userLocal", _this.userLocal);
                        localStorage.setItem("userObject", _this.userModel.toString());
                        localStorage.setItem("authToken", _this.userModel.authenticationToken);
                        _this.router.navigate(["/app/frontpage"]);
                    }
                    else {
                        _this.errorMessage = response.message;
                        console.log(_this.errorMessage);
                    }
                });
            }
            else {
                this.errorMessage = "User Password cannot be empty";
            }
        }
        else {
            this.errorMessage = "User Name cannot be empty";
        }
    };
    Login = __decorate([
        core_1.Component({
            selector: 'login',
            styles: [__webpack_require__("./src/app/login/login.style.scss")],
            template: __webpack_require__("./src/app/login/login.template.html"),
            providers: [LoginService_1.LoginService],
            encapsulation: core_1.ViewEncapsulation.None,
            host: {
                class: 'login-page app'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof LoginService_1.LoginService !== 'undefined' && LoginService_1.LoginService) === 'function' && _a) || Object, (typeof (_b = typeof router_1.Router !== 'undefined' && router_1.Router) === 'function' && _b) || Object])
    ], Login);
    return Login;
    var _a, _b;
}());
exports.Login = Login;


/***/ },

/***/ "./src/app/login/login.module.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var common_1 = __webpack_require__("./node_modules/@angular/common/index.js");
var forms_1 = __webpack_require__("./node_modules/@angular/forms/index.js");
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var login_component_1 = __webpack_require__("./src/app/login/login.component.ts");
exports.routes = [
    { path: '', component: login_component_1.Login, pathMatch: 'full' }
];
var LoginModule = (function () {
    function LoginModule() {
    }
    LoginModule.routes = exports.routes;
    LoginModule = __decorate([
        core_1.NgModule({
            declarations: [
                login_component_1.Login
            ],
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule.forChild(exports.routes),
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], LoginModule);
    return LoginModule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginModule;


/***/ },

/***/ "./src/app/login/login.style.scss":
/***/ function(module, exports) {

module.exports = "/***********************************/\n/**             LOGIN             **/\n/***********************************/\n.logo {\n  width: 25%;\n  height: 75px; }\n\n.login-button {\n  position: absolute;\n  right: 20px;\n  top: 20px; }\n\n.login-page {\n  background-color: #0D192C; }\n\n.errorMessage {\n  text-align: center;\n  color: red; }\n\n.login-page .page-footer {\n  margin-bottom: 25px;\n  font-size: 13px;\n  color: #818a91;\n  text-align: center; }\n  @media (min-height: 600px) {\n    .login-page .page-footer {\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      right: 0; } }\n\n.widget-login-container {\n  padding-top: 10%; }\n\n.widget-login-logo {\n  margin-top: 15px;\n  margin-bottom: 15px;\n  text-align: center;\n  font-weight: 400; }\n  .widget-login-logo .fa-circle {\n    font-size: 13px;\n    margin: 0 20px; }\n\n.widget-login {\n  padding: 30px; }\n  .widget-login > header h1, .widget-login > header h2, .widget-login > header h3, .widget-login > header h4, .widget-login > header h5, .widget-login > header h6 {\n    font-weight: 400;\n    text-align: center; }\n\n.widget-login-info {\n  font-size: 13px;\n  color: #888;\n  margin-top: 1px;\n  margin-bottom: 0;\n  text-align: center; }\n  .widget-login-info.abc-checkbox {\n    margin-left: -25px; }\n\n.login-form .form-control {\n  font-size: 13px;\n  border: none;\n  background-color: #eceeef; }\n  .login-form .form-control:focus {\n    background-color: #ddd; }\n"

/***/ },

/***/ "./src/app/login/login.template.html":
/***/ function(module, exports) {

module.exports = "<!--<div class=\"login-button\">\r\n <a class=\"btn btn-inverse btn-md\" (click)=\"rerouteToOpening()\" style=\"color:white\">Get Transaction Details</a>\r\n</div>-->\r\n<div class=\"container\">\r\n  <main id=\"content\" class=\"widget-login-container\" role=\"main\">\r\n    <div class=\"row\">\r\n      <div class=\"col-xl-4 col-md-6 col-xs-10 offset-xl-4 offset-md-3 offset-xs-1\">\r\n        <h5 class=\"widget-login-logo animated fadeInUp\">\r\n          <img class=\"logo\" src=\"./../../assets/img/ic_launcher.png\"/>\r\n        </h5>\r\n        <section class=\"widget widget-login animated fadeInUp\">\r\n          <header>\r\n            <h3>Login to your BTM Portal</h3>\r\n          </header>\r\n          <div class=\"widget-body\">\r\n            <form class=\"login-form mt-lg\">\r\n              <div class=\"form-group\">\r\n                <input type=\"text\" class=\"form-control\" id=\"exampleInputEmail1\" [(ngModel)]=\"userName\" name=\"userName\" placeholder=\"Username\">\r\n              </div>\r\n              <div class=\"form-group\">\r\n                <input class=\"form-control\" id=\"pswd\" type=\"password\" placeholder=\"Password\" [(ngModel)]=\"userPassword\" name=\"userPassword\">\r\n              </div>\r\n              <div class=\"clearfix\">\r\n                <div class=\"btn-toolbar pull-xs-right m-t-1\">\r\n                  <a class=\"btn btn-inverse btn-sm\" (click) = \"login()\" style=\"color:white\">Login</a>\r\n                </div>\r\n              </div>              \r\n            </form>\r\n            <div class=\"row\">\r\n              <div class=\"col-md-12\">\r\n                <p class=\"errorMessage\">{{errorMessage}}</p>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </section>\r\n      </div>\r\n    </div>\r\n  </main>\r\n  <footer class=\"page-footer\">\r\n    2016 &copy; BTM. Admin Dashboard Template.\r\n  </footer>\r\n</div>\r\n"

/***/ },

/***/ "./src/app/services/LoginService.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var http_1 = __webpack_require__("./node_modules/@angular/http/index.js");
__webpack_require__("./node_modules/rxjs/add/operator/map.js");
var ServiceUrl_1 = __webpack_require__("./src/app/services/ServiceUrl.ts");
var LoginService = (function () {
    function LoginService(http) {
        this.http = http;
        this.urlService = new ServiceUrl_1.ServiceUrl();
    }
    LoginService.prototype.login = function (userName, password) {
        var body = JSON.stringify({ userName: userName, userPassword: password });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "merchant/superadmin", body, options)
            .map(function (res) { return res.json(); });
    };
    LoginService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof http_1.Http !== 'undefined' && http_1.Http) === 'function' && _a) || Object])
    ], LoginService);
    return LoginService;
    var _a;
}());
exports.LoginService = LoginService;


/***/ },

/***/ "./src/app/services/ServiceUrl.ts":
/***/ function(module, exports) {

"use strict";
"use strict";
var ServiceUrl = (function () {
    /*    public baseUrl:string = "http://localhost:5000/";*/
    /* public baseUrl: string = "http://104.199.49.55:3000/";*/
    function ServiceUrl() {
        this.baseUrl = "http://13.234.59.147:4000/";
    }
    ServiceUrl.prototype.getUrl = function () {
        return this.baseUrl;
    };
    return ServiceUrl;
}());
exports.ServiceUrl = ServiceUrl;


/***/ }

});
//# sourceMappingURL=2.map