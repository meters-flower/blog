var mongodb = require('./db');

function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
};

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var info = {
        name: this.name,
        day: this.day,
        title: this.title,
        comment: this.comment
    };
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err); 
        }
        //读取posts集合
        db.collection('posts', function(err, collection) {
            if(err) {
                mongodb.close();
                return callback(err); 
            }  
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的comments数组里
            collection.update({
                "name": info.name,
                "time.day": info.day,
                "title": info.title
            }, {
                $push: {"comments": info.comment}
            }, function(err) {
                mongodb.close();
                if(err) {
                    return callback(err); 
                } 
                callback(null); 
            });
        })
    });
};