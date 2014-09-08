// feedparser - https://www.npmjs.org/package/feedparser
var FeedParser = require('feedparser')
    , request = require('request');

var req = request('http://b.hatena.ne.jp/entrylist?sort=hot&mode=rss')
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
    while (item = stream.read()) {
        console.log(
            item.title + "\t" 
            + item.description + "\t" 
            + item.link + "\t" 
            + item.date
            );
    }
});
