const {MongoClient, Long} = require('mongodb');

const INT32_MAX = 2147483647

let client, db

const connect = (dbUrl) => {
	client = new MongoClient(dbUrl);
	return new Promise((resolve, reject) => {
		client.connect(function(err) {
			if (err) { reject(err); return }
			console.log("connected successfully to data base");
			resolve()
		});
	})
}

const dataFilter = (data) => {
	const filter = (data) => {
		if (!data) return data
		Object.keys(data).forEach(key => {
			if (typeof data[key] === 'number' && data[key] > INT32_MAX) {
				data[key] = Long(data[key] + '')
			} else if (typeof data[key] === 'object') {
				filter(data[key])
			}
		})
		return data
	}
	if (Array.isArray(data)) {
		return data.map(filter)
	} else {
		return filter(data)
	}
}

const getDB = (name) => {
	if (!db || (name && db.databaseName !== name)) {
		db = client.db(name)
	}
	return db
}

const getData = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.find(dataFilter(query)).toArray(function(err, result) {
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getDistinctField = (key, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		col.distinct(key, function(err, result) {
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getOne = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {}, function(err, result) {
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getLastOne = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {sort: [['_id', -1]]}, (err, result) => {
			if (err) { reject(err); return }
			resolve(result)
		})
	})
}

const insertData = (data, colName, dbName) => {
	if (!data || (Array.isArray(data) && !data.length)) return Promise.resolve()

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let array = Array.isArray(data) ? data : [data];
		col.insertMany(dataFilter(array), function(err, result) {
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const updateOne = (query, set, colName, dbName, options) => {

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let updateContent = set['$set'] ? set : { $set: set }
		col.updateOne(dataFilter(query), dataFilter(updateContent), options, function(err, result) {
			if (err) { reject(err); return }
			resolve(result);
		});
	})
}
const upsertOne = (query, set, colName, dbName) => {
	return updateOne(query, set, colName, dbName, {upsert: true})
}


module.exports = {
	connect,
	getData,
	getOne,
	insertData,
	updateOne,
	upsertOne,
	getLastOne,
	getDistinctField,
}
