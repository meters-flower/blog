var express = require('express');
var router = express.Router();
var crypto = require('crypto');  //用来生成散列值来加密密码

var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { 
        title: '主页',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

router.get('/reg', function(req, res) {
    res.render('reg', { 
        title: '注册',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

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

router.get('/login', function(req, res) {
    res.render('login', { 
        title: '登录',
        user: req.session.user,
        success: req.flash('success'.toString()),
        error: req.flash('error'.toString())
    });
});

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

router.get('/post', function(req, res) {
  res.render('post', { title: '发表' });
});

router.get('/post', function(req, res) {
});

router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});

module.exports = router;
