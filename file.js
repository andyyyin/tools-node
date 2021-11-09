const fs = require('fs')

const readFile = (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

const readJSON = (path) => {
	return new Promise((resolve, reject) => {
		readFile(path).then(data => {
			try {
				resolve(JSON.parse(data))
			} catch (e) {
				reject(e)
			}
		}, e => reject(e))
	})
}

const writeJSON = (path, content) => {
	return new Promise((resolve, reject) => {
		if (typeof content !== 'string') content = JSON.stringify(content)
		fs.writeFile(path, content, 'utf8', (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})
	})
}

const readOrInitJSON = (path) => {
	return new Promise((resolve, reject) => {
		let initContent = '{}'
		fs.readFile(path, 'utf8', (err, data) => {
			if (!err) {
				if (!data) data = initContent
				try {
					resolve(JSON.parse(data))
				} catch (e) {
					reject(e)
				}
			} else if (err.code === 'ENOENT') {
				fs.writeFile(path, initContent, (err) => {
					if (err) {
						reject(err)
					} else {
						resolve({})
					}
				})
			} else {
				reject(err)
			}
		})
	})
}

const readDir = (path) => {
	return new Promise((resolve, reject) => {
		fs.readdir(path, function (err, files) {
			if (err) {
				reject(err)
			} else {
				resolve(files)
			}
		})
	})
}

const makeDir = (path) => {
	return new Promise((resolve, reject) => {
		if (fs.existsSync(path)) {
			resolve(true)
			return
		}
		fs.mkdir(path, { recursive: true }, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		});
	})
}

const exist = (path) => {
	return new Promise((resolve, reject) => {
		resolve(fs.existsSync(path))
	})
}

const copyFile = (src, target) => {
	return new Promise((resolve, reject) => {
		fs.copyFile(src, target, err => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})
	})
}

const isDirectory = (path) => {
	return new Promise((resolve, reject) => {
		fs.stat(path, (err, stat) => {
			if (err) {
				reject(err)
			} else {
				resolve(stat.isDirectory())
			}
		})
	})
}

module.exports = {
	readFile,
	readJSON,
	writeJSON,
	readOrInitJSON,
	readDir,
	makeDir,
	exist,
	copyFile,
	isDirectory
}