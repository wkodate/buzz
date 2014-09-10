// feedparser - https://www.npmjs.org/package/feedparser
var FeedParser = require('feedparser')
    , request = require('request');

// Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/testdb', function(err) {
    if (err) {
        console.log(err);
    }
});
var buzzwordSchema = mongoose.Schema({
    name: String,
    date: Date,
    xmlurl: String
});
var Buzzword = mongoose.model('Buzzword', buzzwordSchema);

// RSS URL
var xmlurl = 'http://kizasi.jp/rss.xml';

var req = request(xmlurl)
    , feedparser = new FeedParser(); // new FeedParser([options])でoptions設定

req.on('error', function (error) {
    // リクエストエラー処理
});
req.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) {
        return this.emit('error', new Error('Bad status code'));
    }
    stream.pipe(feedparser);
});

feedparser.on('error', function(error) {
    // 通常のエラー処理
});
feedparser.on('readable', function() {
    // 処理ロジックを書く
    // metaプロパティはfeedeparserインスタンスのコンテキストに常に置き換える
    var stream = this
        , meta = this.meta
        , item;

    // 取得したアイテムをMongoDBに保存
    var buzzword = new Buzzword();
    while (item = stream.read()) {
        buzzword.name = item.title;
        buzzword.date = item.date;
        buzzword.xmlurl = xmlurl;
        buzzword.save(function(err, buzzword) {
            if (err) {
                console.log(err);
            }
        });
    }
})
