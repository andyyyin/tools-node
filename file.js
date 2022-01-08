const fs = require('fs')

const readFile = (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data && data.toString())
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
		}, reject)
	})
}

const writeFile = (path, content) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, 'utf8', (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})
	})
}

const writeJSON = (path, content) => {
	return new Promise((resolve, reject) => {
		if (typeof content !== 'string') content = JSON.stringify(content)
		writeFile(path, content).then(resolve, reject)
	})
}

const initJSON = async (path, initContent) => {
	initContent = initContent || '{}'
	await makeDir(getDirPathFromFile(path))
	await writeJSON(path, initContent)
}

const readOrInitJSON = async (path, initContent) => {
	try {
		return await readJSON(path)
	} catch (e) {
		if (e.code === 'ENOENT') {
			await initJSON(path, initContent)
		} else {
			throw e
		}
	}
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

const getDirPathFromFile = (filePath) => {
	let pathGroup = filePath.split(/[/|\\]/)
	pathGroup.pop()
	return pathGroup.join('/')
}

module.exports = {
	readFile,
	readJSON,
	writeFile,
	writeJSON,
	readOrInitJSON,
	readDir,
	makeDir,
	exist,
	copyFile,
	isDirectory,
	getDirPathFromFile,
	initJSON,
}