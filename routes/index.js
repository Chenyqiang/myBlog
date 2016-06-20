var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(app){
	app.get('/',function(req,res){
		Post.get(null,function(err,posts){
			if (err) {
				posts = [];
			}
			res.render('index',{
				title:'主页',
				user:req.session.user,
				posts:posts,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			});
		});
	});
	//app.get('/reg', checkNotLogin);
	app.get('/reg',function(req,res){
		res.render('reg',{
			title:'注册',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	/* 存在问题
	app.get('/reg/checkName',function(req,res){
		// req.query 获取URL的查询参数串
		var name = req.query.name;
		User.get(name , function(err,user){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			if (user) {
				return "true";
			}
			return "false";
		});
	});
	*/
	//app.get('/reg', checkNotLogin);
	app.post('/reg',function(req,res){
		var name = req.body.name;
		var password = req.body.password;
		// 生成密码的 md5 值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name : name ,
			password : password,
			email : req.body.email
		});
		// 检查用户名是否已经存在
		User.get(newUser.name , function(err,user){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			if (user) {
				req.flash('error','用户名已经存在');
				return res.redirect('/reg');
			}
			// 新增用户
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				console.log('index.js : ',user);
				req.session.user = newUser;// 用户信息存入session
				req.flash('success','注册成功');
				res.redirect('/');
			});
		});
	});
	//app.get('/login', checkNotLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title:'登录',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	//app.post('/login', checkNotLogin);
	app.post('/login',function(req,res){
		// 生成密码的md5值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		// 检查用户是否存在
		User.get(req.body.name,function(err,user){
			if (!user){
				req.flash('error','用户不存在！');
				return res.redirect('/login');
			}
			// 检查密码是否一致
			if (user.password != password) {
				req.flash('error','密码错误');
				return res.redirect('/login');
			}
			// 登录成功后将信息存入session中
			req.session.user = user;
			req.flash('success','登录成功');
			res.redirect('/');
		});
	});
	app.get('/post', checkLogin);
	app.get('/post',function(req,res){
		res.render('post',{
			title:'发表',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.get('/post', checkLogin);
	app.post('/post',function(req,res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name,req.body.title,req.body.post);
		post.save(function (err){
			if (err) {
				req.flash('err',err);
				return res.redirect('/');
			}
			req.flash('success','发布成功');
			res.redirect('/');
		});
	});
	//app.get('/logout', checkLogin);
	app.get('/logout',function(req,res){
		req.session.user = null;
		req.flash('success', '登出成功!');
		res.redirect('/login');
	});
	
	function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash('error','用户未登录');
			res.redirect('/login');
		}
		next();
	}
	
	function checkNotLogin(req,res,next){
		if(req.session.user){
			req.flash('error','已登录');
			res.redirect('back');
		}
		next();
	}
};