var fs = require('fs'),
	path = require('path'),
	marked = require('marked');



/*
*RegExp rulers
*/
mdReg = {
	//将md文件的文件头提取出来
	regHead:"---\n(.*\n)*---",
	regBody:""
}

/*
*postOptions:head, body,filename
*/

function MD(){
	this.mdReg = '';
	this.postOptions = {};
}

MD.mdReg = mdReg;
MD.base = process.cwd();
MD.base_posts = path.join(MD.base, '_posts');
/*
* 读取指定目录中的.md文件,默认目录为"_posts"目录
*/
MD.readPosts = function(dirpath){
	var dirpath = dirpath || this.base_posts;
	fs.readdir(dirpath, function(err, files){
		if(!err){
			for(var file in files){
				var filename = path.join(dirpath, files[file]);
				if(path.extname(filename) == ".md")
				{
					fs.readFile(filename, 'utf-8',function(err,  data){
						if(!err){
							console.log('filename:',filename);
							MD.getMetaData(data, filename);
						}
					})
				}else{
					console.log("This is not a mardown file.")
				}
			}
		}
	})
}

/*
* 提取post信息
*/
MD.getMetaData = function(data, filename){
	var reg = new RegExp(this.mdReg.regHead);

	var res = data.match(reg);
	if(res == null){
		return this;
	}

	//parse post body
	var postBody = data.substr(res[0].length);

	//提取模板,标题等信息,当元信息有多个时提取出来,例:tags:reading, write
	var postMeta = res[0].match(/\w+:\s*\w+(\s*,\s*\w+)*/g);
	var options = {};
	for(var i = 0; i < postMeta.length; i++)
	{
		var tmp = postMeta[i].match(/\b\w+\b/g);
		//tmp为一个元数据数组,第一个元素为元数据名,后面为对应的值(值可能会有多个)
		if(!options[tmp[0]]){
			if(tmp.length > 2){
				var array = [];
				for(var i = 1; i < tmp.length; i++)
				{
					array[i-1] = tmp[i]; 
				}
				options[tmp[0]] = array;
			}else{
				options[tmp[0]] = tmp[1];
			}	
		}
	}

	/*
	* post data
	*/
	var postData = {
		head:options,
		body:postBody,
		name:filename
	}
	this.postOptions = postData;
	console.log(this.postOptions.body);
}

MD.mdToHtml = function(){
	/*
	* 将生成的HTML文件放到sites目录下
	*/
	var _html = marked(MD.postOptions.body);
	console.log(_html);

}
var mdProcess = new MD();
MD.readPosts();

console.log('当前目录：' + process.cwd());