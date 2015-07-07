var fs = require('fs'),
	path = require('path'),
	marked = require('marked'),
	swig = require('swig');

/*
* main.js
*/
/*
*RegExp rulers
*/
mdReg = {
	//将md文件的文件头提取出来
	regHead:"---\n(.*\n)*---",
	regBody:""
}

function MD(){
	//default config
	this.base = process.cwd();
	this.base_posts = path.join(this.base, '_posts');
	this.base_sites = path.join(this.base, 'sites');
	this.base_layouts = path.join(this.base, '_layouts');
	this.mdReg = mdReg;
	this.version = "0.0.1";

	this.posts = [];
}




/*
* 读取指定目录中的.md文件,默认目录为"_posts"目录
*/
MD.prototype.readPosts = function(dirpath){
	self = this;
	var dirpath = dirpath || this.base_posts;
		var files = fs.readdirSync(dirpath);
		if(files){
			for(var file in files){
				//filename:include dir path
				//filetitle:Only file name
				var filename = path.resolve(dirpath, files[file]);
				var fileStat = fs.statSync(filename);

				if(fileStat && fileStat.isDirectory()){
					console.log(filename);
					self.readPosts(filename);
				}else{
					var filetitle = files[file].slice(0, -3);
					console.log('the file name:',filetitle)
					if(path.extname(filename) == ".md")
					{
						/*
						fs.readFile(filename, 'utf-8',function(err,  data){
							if(!err){
								self.storePostsData(data, filetitle);
								
							}
						})
						*/
						var data = fs.readFileSync(filename,'utf-8');
						if(data){
							self.storePostsData(data, filetitle);
						}
					}else{
						console.log("This is not a mardown file.")
					}	
				}
			}
		}
}

/*
* 提取.md文件头信息
*/
MD.prototype.getMdHead = function(data){
	var reg = new RegExp(this.mdReg.regHead);

	var res = data.match(reg);
	if(res == null){
		var result = {
			head:null,
			body:data
		}
		return result;
	}

	//parse post body
	var Body = data.substr(res[0].length);

	//提取模板,标题等信息,当元信息有多个时提取出来,例:tags:reading, write
	//var postMeta = res[0].match(/\w+:\s*\w+(\s*,\s*\w+)*/g);
	var postMeta = res[0].match(/\w+\s*:.*/g);
	console.log('postMeta:',postMeta);
	var options = {};
	for(var i = 0; i < postMeta.length; i++)
	{
		var tmp = postMeta[i].replace(/\s+/g, '');
		var strIndex = tmp.indexOf(':');
		console.log("meta message:", strIndex);

		if(strIndex){
			var key = tmp.substr(0, strIndex);
			var value = tmp.substr(strIndex+1);
			value = value.split(/\s*,\s*/);
			options[key] = value;
		}
	}
	var result = {head:options,
		body:Body};
	return result;
}

/*
* 提取post信息并生成HTML文件
*/
MD.prototype.storePostsData = function(data, filename){
	self = this;
	var result = this.getMdHead(data);
	/*
	* post data
	*/
	var postData = {
		head:result.head,
		body:result.body,
		name:filename,
		htmlPostData:''
	}	
	//markdownToHtml
	//console.log(postData);
	postData.htmlPostData = marked(postData.body);
	console.log('marked:',postData.htmlPostData);
	this.posts[postData.name] = postData;

	//generate Html files
	//category the html files
	this.render(postData, function(postData){
		var category = postData.head.category;

		if(category){
			console.log("category:",category[0]);
			//category is a array
			var dirpath = path.resolve(self.base_sites, category[0]);
			fs.mkdir(dirpath, function(err){
				var writepath = path.join(dirpath, postData.name) + '.html';

				fs.writeFile(writepath,  postData.htmlPostData, function(err){
					if(!err){
						console.log("%s file generated success.",postData.name);
					}
				})
			})
		}else{
			var writepath = path.join(self.base_sites, postData.name) + '.html';
			fs.writeFile(writepath,  postData.htmlPostData, function(err){
				if(!err){
					console.log("%s file generated success.",postData.name);
				}
			})
		}
	}); //using the layout

	
	return this;
}

//using the layouts , render post
MD.prototype.render = function(postData, callback){
	var baselayout = this.base_layouts;
	var posts = this.posts;
	
	var n = 0;
	for(var p in posts){
		n++;
		var layout = posts[p].head.layout ;
		console.log('posts head:', posts[p].htmlPostData);
		var htmlBody = posts[p].htmlPostData;
		var layoutpath = path.join(baselayout, layout[0]) + '.html';
		var data = fs.readFileSync(layoutpath, 'utf-8');
		
		//todo:render repeated!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		if(typeof data == 'string' && !posts[p].isHtml){
			var str = data.replace(/<%content%>/,htmlBody);
			posts[p].htmlPostData = str;
			posts[p].isHtml = true;
			//console.log('replaced:', str);
		}
	}
	callback(postData);
}
//generate static pages
MD.prototype.gStaticPage = function(filename, data){
	var dir = this.base_sites;
	var writepath = path.join(dir, filename);
	fs.writeFile(writepath, data,function(err){
		if(!err){

			console.log("%s file generate success.",filename);
		}
	})
}
//render html pages
MD.prototype.renderPage = function(pathname, posts, filename){
	self = this;
	//使用post中的数据渲染模板
	swig.renderFile(pathname, posts, function(err, output){
		self.gStaticPage(filename, output);
		console.log('rendered\n',output);
	});
}

//render md page
MD.prototype.renderMdPage = function(swigStr, data, filename){
	var swigData = {
		locals:data
	}
	var str = '';
	str = swig.render(swigStr, swigData);
	this.gStaticPage(filename, str);

	console.log('site basename:', str);
}
//site(siteData): render data
MD.prototype.readMDDir = function(dir, site){
	self = this;
	fs.readdir(dir, function(err, files){
		if(!err){
			files.forEach(function(item){
				var filepath = path.resolve(dir, item);
				var filename = item;
				fs.stat(filepath, function(err, stat){
					if(stat && stat.isDirectory()){
						self.readMDDir(filepath, site);
					}else{
						console.log('the page name:',filename);
						if(path.extname(filepath) == ".html"){
							self.renderPage(filepath, site, filename);
						}else if(path.extname(filepath) == ".md"){
							var layoutpath = path.join(self.base_layouts, 'defualt.html');
							var mdData = fs.readFileSync(filepath, 'utf-8');

							var layoutData = '';
							layoutData = fs.readFileSync(layoutpath, 'utf-8');
							var pageBody = {};
							pageBody = self.getMdHead(mdData);
							
							//console.log("mdData:",layoutpath);					
							filename = filename.slice(0, -3) + '.html';	
							if(typeof mdData == 'string'){
								//console.log('result body:',result);
								var str = layoutData.replace(/<%content%>/g, pageBody.body);
								self.renderMdPage(str, site, filename);	
							}
						}else{

						}
					}
				})
				
			})
		}
	});
}

//read public pages
MD.prototype.readPublicPages = function(){
	var self = this;
	var pagesDir = path.join(this.base, 'public');

	//渲染接口数据
	var renderData = {}, site = {};
	for(var p in self.posts)
	{
		//console.log('head data:', self.posts[p].head.title[0]);
		var render = {};
		render.title = self.posts[p].head.title[0];
		render.category = self.posts[p].head.category ?self.posts[p].head.category[0] : null;
		render.tags= self.posts[p].head.tags || null;

		renderData[p] = render;
	}
	site.posts = renderData;
	site.basename = "Yangxiaofu-blog!";
	//console.log('render data:', renderData);
	self.readMDDir(pagesDir, site);
}

MD.prototype.generatePage = function(){
	this.readPosts();
	this.readPublicPages();
}

var mark = new MD();
mark.generatePage();