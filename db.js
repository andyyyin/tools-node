const {MongoClient, Long} = require('mongodb');

const INT32_MAX = 2147483647

let client, db, isConnected

const connect = (dbUrl) => {
	if (client && isConnected) {
		console.log("already connected");
		return
	}
	client = new MongoClient(dbUrl);
	return new Promise((resolve, reject) => {
		client.connect().then(function() {
			isConnected = true
			console.log("connected successfully to data base");
			resolve()
		}).catch(e => {
			client.close()
			reject(e)
		})
	})
}

const buildForSave = (data) => {
	const fun = (obj, key) => {
		if (typeof obj[key] === 'number' && obj[key] > INT32_MAX) {
			obj[key] = new Long(obj[key] + '')
		}
	}
	return dataFilter(data, fun)
}

const restoreData = (data) => {
	const fun = (obj, key) => {
		if (obj[key] && obj[key] instanceof Long) {
			obj[key] = obj[key].toNumber()
		}
	}
	return dataFilter(data, fun)
}

const dataFilter = (data, fun) => {
	if (!fun) return data
	const filter = (data) => {
		if (!data) return data
		Object.keys(data).forEach(key => {
			fun(data, key)
			if (typeof data[key] === 'object') {
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
		col.find(buildForSave(query)).toArray().then(function(result) {
			restoreData(query)
			resolve(result)
		}).catch(reject)
	})
}

const getLimitData = (query, options, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		const buildQuery = buildForSave(query)
		Promise.all([col.countDocuments(buildQuery), col.find(buildQuery, options).toArray()])
			.then(([count, list]) => {
				restoreData(query)
				resolve({count, list})
			}).catch(reject)
	})
}

const getDistinctField = (key, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		col.distinct(key).then(function(result) {
			resolve(result)
		}).catch(reject);
	})
}

const getOne = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(buildForSave(query), {}).then(function(result) {
			restoreData(query)
			resolve(result)
		}).catch(reject)
	})
}

const getLastOne = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(buildForSave(query), {sort: [['_id', -1]]}).then((result) => {
			restoreData(query)
			resolve(result)
		}).catch(reject)
	})
}

const insertData = (data, colName, dbName) => {
	if (!data || (Array.isArray(data) && !data.length)) return Promise.resolve()

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let array = Array.isArray(data) ? data : [data];
		col.insertMany(buildForSave(array)).then(function(result) {
			restoreData(array)
			resolve(result)
		}).catch(reject)
	})
}

const updateOne = (query, set, colName, dbName, options) => {

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let updateContent = set.$set || set.$push ? set : { $set: set }
		col.updateOne(buildForSave(query), buildForSave(updateContent), options).then(function(result) {
			restoreData(query)
			restoreData(updateContent)
			resolve(result);
		}).catch(reject)
	})
}
const upsertOne = (query, set, colName, dbName) => {
	return updateOne(query, set, colName, dbName, {upsert: true})
}

const deleteData = (query, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.deleteMany(buildForSave(query)).then(function(result) {
			restoreData(query)
			resolve(result)
		}).catch(reject)
	})
}


module.exports = {
	connect,
	getData,
	getOne,
	insertData,
	updateOne,
	upsertOne,
	deleteData,
	getLastOne,
	getDistinctField,
	getLimitData,
}
