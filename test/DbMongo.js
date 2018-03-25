/* eslint-env node, mocha */
const assert = require("chai").assert;
const path = require("path");
const fs = require("fs");

const Song = require("./../src/lib/Song");

//Test data
const songs =[];
const songsRaw = JSON.parse(fs.readFileSync(path.join(__dirname,"testData","songs.json"),{encoding:"utf8"}));
songsRaw.forEach(element => {
	songs.push(new Song(element));
});
const users = JSON.parse(fs.readFileSync(path.join(__dirname,"testData","users.json"),{encoding:"utf8"}));
var idOfFirstSong;

//Setup 
const dbModule = require("./../src/lib/DbMongo");
var db = new dbModule({
	database:{
		url:"mongodb://localhost:27017/test"
	}
});

//Tests

describe("Connect",function(){
	it("Normal Connect",function(done){
		db.connect(function(err){
			assert.ifError(err);
			done();
		});
	});
});

describe("Setup",function(){

	it("Setup",function(done){
		db.setup({
			username:"defaultUser",
			password:"$2a$04$mOnyxnnJZK48GI6zT9ng7uZWLEW5S6zAV7CkpTkt6ILnztPdnwkDy" //1234
		},function(err){
			assert.ifError(err);
			done();
		});
	});

	it("Default User exists",function(done){
		db.getUser("defaultUser",function(err,result){
			assert.ifError(err);
			assert.deepEqual(result,{username:"defaultUser",password:"$2a$04$mOnyxnnJZK48GI6zT9ng7uZWLEW5S6zAV7CkpTkt6ILnztPdnwkDy"});
			done();
		});
	});
});

describe("Insert test data",function(){

	it("Insert songs",function(done){
		let itemsDone = 0;
		songs.forEach(function(element,index,array){
			db.addSong(element,function(err){
				assert.ifError(err);
				itemsDone++;
				if(itemsDone === array.length){
					done();
				}
			});
		});
	});

	it("Insert users",function(done){
		let itemsDone = 0;
		users.forEach(function(element,index,array){
			db.addUser(element.username,element.password,function(err){
				assert.ifError(err);
				itemsDone++;
				if(itemsDone === array.length){
					done();
				}
			});
		});
	});

});

describe("Get Songs",function(){
	it("Get all songs",function(done){
		db.getSongs({},function(err,result){
			assert.ifError(err);
			assert.isArray(result);
			assert.equal(result.length,songsRaw.length);
			//TODO: more tesing
			done();
		});
	});

	it("Get songs with filter",function(done){
		db.getSongs({
			file:"ArtistName1/AlbumName1/song1.mp3"
			/*
			metadata:{
				title:songs[0].metadata.title
			}
			*/
		},function(err,result){
			assert.ifError(err);
			assert.isArray(result);
			assert.equal(result.length,1);
			assert.equal(result[0].file,songs[0].file);
			assert.equal(result[0].metadata.title,songs[0].metadata.title);

			//Get id for later testing
			idOfFirstSong = result[0].id;

			done();
		});
	});
});

describe("Get single song",function(){
	it("Get single song by id",function(done){
		db.getSong(idOfFirstSong,function(err,result){
			assert.ifError(err);
			assert.equal(result.id,idOfFirstSong);
			
			done();
		});
	});
});

describe("getArtists",function(){
	it("Normal",function(done){
		db.getArtists(function(err,result){

			assert.ifError(err);
			assert.isArray(result);
			assert.deepInclude(result,{name:"ArtistName1",numSongs:1});
			assert.deepInclude(result,{name:"ArtistName1",numSongs:1});
			assert.deepInclude(result,{name:"Unknown artist",numSongs:1},"result dosnt conatin 'Unknown artist'");
			done();
		});
	});
});

describe("getAlbums",function(){
	it("Normal",function(done){
		db.getAlbums(function(err,result){

			assert.ifError(err);
			assert.isArray(result);
			assert.deepInclude(result,{name:"AlbumName1",numSongs:1});
			assert.deepInclude(result,{name:"AlbumName2",numSongs:1});
			assert.deepInclude(result,{name:"Unknown album",numSongs:1},"result dosnt conatin 'Unknown album'");
		

			done();
		});
	});
});

describe("updateSong",function(){
	it("Change metadata",function(done){
		let updateSong = new Song({id:idOfFirstSong,metadata:{year:2000}});
		db.updateSong(updateSong,function(err){
			assert.ifError(err);
			db.getSong(idOfFirstSong,function(err,result){
				assert.ifError(err,"Error when checking the change");
				assert.equal(result.metadata.year,2000,"Didnt change the attribute");
				done();
			});
		});
	});
});


describe("removeSong",function(){
	it("Normal",function(done){
		db.removeSong(idOfFirstSong,function(err){
			assert.ifError(err);
			done();
		});
	});

	it("Check if the song has been removed",function(done){
		db.getSong(idOfFirstSong,function(err,result){
			assert.ifError(err);
			assert.isNull(result);
			done();
		});
	});
});

describe("Get All User",function(){
	it("normal",function(done){
		db.getAllUsers(function(err,result){
			assert.ifError(err);
			assert.isArray(result);
			assert.deepInclude(result,{username:"user1",password:"somethingHash"});
			assert.deepInclude(result,{username:"user2",password:"somethingHash"});

			done();
		});
	});
});

describe("Update Password",function(){
	it("Change password",function(done){
		db.updatePassword("user1","newPass",function(err){
			assert.ifError(err);
			db.getUser("user1",function(err,user){
				assert.ifError(err);
				assert.deepEqual(user,{username:"user1",password:"newPass"});

				done();
			});
		});
	});
});
