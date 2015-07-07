/*
* post class:
head:[layout,default],
postName:2014-05-09-rubystyle.md
postBody:"xxxxx"
*/

function Post(opts){
	this.postHead = opts.postHead;
	this.postBody = opts.postBody;
	this.postName = opts.postName;

	this.htmlBody = null;
}

Post.prototype.mdToHtml = function(){
	this.htmlBody = marked(this.postBody);
}

function createPost (opts){
	var post = new Post(opts);
	return post;
}
module.exports = createPost;