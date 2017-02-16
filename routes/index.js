var express = require('express');
var router = express.Router();
var crypto = require('crypto');  //用来生成散列值来加密密码
var fs = require('fs');
var multiparty = require('multiparty'); //文件上传

var User = require('../models/user.js');
var Post = require('../models/post.js');

/*页面权限控制
 *即注册和登录页面应该阻止已登录的用户访问，登出后的发表页只对已登录的用户开发
 */
function checkLogin(req, res, next ) {
    if(!req.session.user) {
        req.flash('error', '未登录！');
        res.redirect('/login');
    }
    next(); //转移控制权
}
function checkNotLogin(req, res, next ) {
    if(req.session.user) {
        req.flash('error', '已登录！');
        res.redirect('back');
    }
    next();
}

/* 路由控制 */
router.get('/', function(req, res) {
    Post.get(null, function(err, posts) {
        if(err) {
            posts = [];
        }
        res.render('index', { 
            title: '主页',
            user: req.session.user,
            posts: posts,
            success: req.flash('success'.toString()),
            error: req.flash('error'.toString())
        });
    });

});

router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', { 
        title: '注册',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res) {
    var name =  req.body.username,
        password = req.body.password,
        password_re = req.body.repwd;
    //检验两次输入的密码是否一致
    if(password != password_re) {
        req.flash('error', '两次输入的密码不一致！');
        return res.redirect('/reg');
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
        pwd = md5.update(password).digest('hex');
    var newUser = new User({
        name: name,
        password:pwd
    });
    //检查用户是否存在
    User.get(newUser.name, function(err, user) {
        if(user) {
            req.flash('error', '用户已存在！');
            return res.redirect('/reg');
        }
        //如果用户不存在则新增用户
        newUser.save(function(err, user) {
            if(err) {
                req.flash('error', err);
                return res.redirect('/reg'); //注册失败返回注册页
            }
            req.session.user = user; //用户信息存入session
            req.flash('success', '注册成功！');
            res.redirect('/'); //注册成功返回主页
        });
    });
});

router.get('/login',checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', { 
        title: '登录',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

router.post('/login',checkNotLogin);
router.post('/login', function(req, res) {
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.username, function(err, user) {
        if(!user) {
            req.flash('error', '用户不存在！');
            return res.redirect('/login');
        }
        //检查密码是否一致
        if(user.password != password) {
            req.flash('error', '密码错误！');
            return res.redirect('/login');
        }
        //用户名密码都匹配后，将用户信息存入session
        req.session.user = user; 
        req.flash('success', '登录成功！');
        res.redirect('/'); 
    });
});

router.get('/post',checkLogin);
router.get('/post', function(req, res) {
    res.render('post', { 
        title: '发表',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

router.post('/post',checkLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.content);
    post.save(function(err) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功！');
        res.redirect('/'); 
    });

});

router.get('/logout',checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});

router.get('/upload',checkLogin);
router.get('/upload', function(req, res) {
    res.render('upload', { 
        title: '文件上传',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

router.post('/upload',checkLogin);
router.post('/upload', function(req, res) {
    //设置临时上传目标路径
    var form = new multiparty.Form({uploadDir: './public/images/'});
    form.parse(req, function(error, fields, files) {
        for(var i in files) {
            var file = files[i]
            if(file[0].size == 0) {
                //使用同步方式删除一个空文件
                fs.unlinkSync(file[0].path);
                console.log('Successfully removed a empty file!');
            }else {
                var target_path = './public/images/'+file[0].originalFilename;
                //使用同步方式重命名一个文件
                fs.renameSync(file[0].path, target_path);
                console.log('Successfully renamed a file!');
            }
        }
        req.flash('success', '文件上传成功！');
        res.redirect('/upload');         
    });
});

module.exports = router;
