var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
};

module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function(callback) {
    //存储各种时间格式，方便以后扩展
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    };
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    };
    //打开数据库
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err); //错误，返回err信息
        }
        //读取posts集合
        db.collection('posts', function(err, collection) {
            if(err) {
                mongodb.close();
                return callback(err); //错误，返回err信息
            }  
            //将文章插入posts集合
            collection.insert(post, {safe: true}, function(err) {
                mongodb.close();
                if(err) {
                    return callback(err); //错误，返回err信息
                } 
                callback(null); //返回err为null
            });
        })
    });
};

//读取文章及相关信息
Post.get = function(name, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err); //错误，返回err信息
        }
        //读取posts集合
        db.collection('posts', function(err, collection) {
            if(err) {
                mongodb.close();
                return callback(err); //错误，返回err信息
            }  
            var query = {};
            if(name) {
                query.name = name;
            }
            //根据query对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function(err,docs) {
                mongodb.close();
                if(err) {
                    return callback(err); //失败，返回err信息
                } 

                //解析markdown为html
                docs.forEach(function(doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                
                callback(null, docs); //成功!以数组形式返回查询结果              
            });
        })
    });
}