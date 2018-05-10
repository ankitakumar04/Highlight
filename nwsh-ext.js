/**
 * Created with JetBrains PhpStorm.
 * User: MSI
 * Date: 26.09.14
 * Time: 14:38
 * To change this template use File | Settings | File Templates.
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    var path = 'path=/';
    var domain = 'domain=.newshub.org';
    document.cookie = cname + "=" + cvalue + "; " + expires + '; ' + path + '; ' + domain;
}

setCookie('NWSH_EXT',true,1);