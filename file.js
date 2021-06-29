import fs from 'fs'

const readFile = (path) => {
	return new Promise(resolve => {
		fs.readFile(path, (err, data) => {
			if (err) {
				console.error(err)
				resolve(false)
			} else {
				resolve(data)
			}
		})
	})
}

const readJSON = (path) => {
	return new Promise(resolve => {
		readFile(path).then(data => {
			try {
				resolve(JSON.parse(data))
			} catch (e) {
				console.error(e)
			}
		})
	})
}

const writeFile = (path, content) => {
	return new Promise(resolve => {
		if (typeof content !== 'string') content = JSON.stringify(content)
		fs.writeFile(path, content, 'utf8', (err) => {
			if (err) {
				console.error(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

const readOrInitFile = (path) => {
	return new Promise(resolve => {
		let initContent = '{}'
		fs.readFile(path, 'utf8', (err, data) => {
			if (!err) {
				if (!data) data = initContent
				resolve(JSON.parse(data))
			} else if (err.code === 'ENOENT') {
				fs.writeFile(path, initContent, (err) => {
					if (err) console.error(err)
					resolve({})
				})
			} else {
				console.error(err)
				resolve(false)
			}
		})
	})
}

const readDir = (path) => {
	return new Promise(resolve => {
		fs.readdir(path, function (err, files) {
			if (err) {
				console.error(err)
				resolve(false)
			}
			resolve(files)
		})
	})
}

const makeDir = (path) => {
	return new Promise(resolve => {
		if (fs.existsSync(path)) {
			resolve(true)
			return
		}
		fs.mkdir(path, { recursive: true }, (err) => {
			if (err) {
				console.error(err)
				resolve(false)
			}
			resolve(true)
		});
	})
}

const exist = (path) => {
	return new Promise(resolve => {
		resolve(fs.existsSync(path))
	})
}

const copyFile = (src, target) => {
	return new Promise(resolve => {
		fs.copyFile(src, target, err => {
			if (err) {
				console.error(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

const isDirectory = (path) => {
	return new Promise(resolve => {
		fs.stat(path, (err, stat) => {
			if (err) {
				console.error(err)
				resolve(false)
			}
			resolve(stat.isDirectory())
		})
	})
}

export default {
	readFile,
	readJSON,
	writeFile,
	readOrInitFile,
	readDir,
	makeDir,
	exist,
	copyFile,
	isDirectory
}