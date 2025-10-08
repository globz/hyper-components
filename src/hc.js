// Dynamic asynchronous import
const importAsync = async function* importAsyncIterator(moduleSpecifiers = []) {
	yield moduleSpecifiers.map(async moduleSpecifier => {
		return await import(moduleSpecifier);
	});
};

const makeModuleImportSpecifier = (importList = []) => {
	return importList.map(o =>
		`${o.dir}/${o.src}`);
};

const getRawAttribute = (elt, name) => {
	return elt.getAttribute && elt.getAttribute(name);
}

const hasAttribute = (el, qualifiedName) => {
	return el.hasAttribute && (el.hasAttribute(qualifiedName) ||
		el.hasAttribute("data-" + qualifiedName));
};

const getAttributeValue = (elt, qualifiedName) => {
	return getRawAttribute(elt, qualifiedName) || getRawAttribute(elt, "data-" + qualifiedName);
};

const isEmpty = (obj) => {
	return Object.entries(obj).length === 0 && obj.constructor === Object;
};

// hc attributes & selector
const HC_ATTR = ['define', 'import'];
const HC_SELECTOR = HC_ATTR.map(function(attr) {
	return "[hc-" + attr + "], [data-hc-" + attr + "]";
}).join(", ");

const _moduleSpecifier = ({
	_import = [],
	_define = [],
} = {}) => ({
	_import,
	_define,
});

const scanDOM = (selector) => {
	if (document.querySelectorAll) {
		hc.defaultComponentDirectory = document.querySelector('body[hc-dir]').getAttribute('hc-dir') || '/';
		let result = document.querySelectorAll(selector);
		return result;
	} else {
		return [];
	}
};

const processNodeList = (NodeListToProcess) => {
	let moduleSpecifier = _moduleSpecifier({});
	NodeListToProcess.forEach((el) => {
		processAttributes(el, moduleSpecifier);
	});

	return moduleSpecifier;
};

const processAttributes = (el, moduleSpecifier) => {
	let dir = String();
	let src = String();
	let tagName = String();
	HC_ATTR.forEach((attr) => {
		// detect element component directory override
		dir = (hasAttribute(el, 'hc-dir'))
			? getAttributeValue(el, 'hc-dir')
			: hc.defaultComponentDirectory;
		if (hasAttribute(el, 'hc-' + attr)) {
			tagName = el.tagName.toLowerCase();
			src = getAttributeValue(el, 'hc-' + attr);
			moduleSpecifier['_' + `${attr}`].push({ dir: dir, src: src, tagName: tagName });
		}
	});

	return moduleSpecifier;
};

const allowedFileExtension = (str) => str.match(/\.(js|mjs)$/i);

const normalizePath = (moduleSpecifier) => {
	moduleSpecifier._define.forEach((m) => {
		// Remove trailing slash
		m.dir = m.dir.endsWith('/') ? m.dir.slice(0, -1) : m.dir;
		// Remove leading slash .js extension
		m.src = m.src.startsWith('/') ? m.src.slice(1) : m.src;
		// Detect allowed file extension else default to .js
		let _fileExtension = allowedFileExtension(m.src);
		m.src = (_fileExtension != null) ? m.src : m.src.concat('.js');
	});
	moduleSpecifier._import.forEach((m) => {
		// Remove trailing slash
		m.dir = m.dir.endsWith('/') ? m.dir.slice(0, -1) : m.dir;
		// Remove leading slash .js extension
		m.src = m.src.startsWith('/') ? m.src.slice(1) : m.src;
		// Detect allowed file extension else default to .js
		let _fileExtension = allowedFileExtension(m.src);
		m.src = (_fileExtension != null) ? m.src : m.src.concat('.js');
	});

	return moduleSpecifier;
};

const hc = {

	modules: async (moduleImportSpecifiers) => {
		for await (let module of importAsync(moduleImportSpecifiers)) {
			return module;
		}
	},

	defaultComponentDirectory: '/',

	define: async (defineList = []) => {
		const modules = await hc.import(defineList);
		for (let i = 0; i < modules.length; i++) {
			let constructorName = Object.getOwnPropertyNames(modules[i]);
			if (!customElements.get(defineList[i].tagName))
				customElements.define(defineList[i].tagName, modules[i][constructorName]);
		}
	},

	import: async (importList = []) => {
		const moduleImportSpecifiers = makeModuleImportSpecifier(importList);
		const promises = await hc.modules(moduleImportSpecifiers);
		return await Promise.all(promises);
	},

	dispatch: (moduleSpecifier = {}) => {
		if (isEmpty(moduleSpecifier)) return false;
		hc.define(moduleSpecifier._define);
		hc.import(moduleSpecifier._import);
		return true;
	},

	mutations: (fn) => {
		const mutationObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length != 0) {
					fn(mutation.addedNodes);
				}
			});
		});
		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	},

};

function _hc_init(fn) {
	if (document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
};

_hc_init(async function() {
	let NodeListToProcess = scanDOM(HC_SELECTOR);
	console.log(NodeListToProcess);
	let moduleSpecifier = normalizePath(processNodeList(NodeListToProcess));
	hc.dispatch(moduleSpecifier);
	hc.mutations((_NodeListToProcess) => hc.dispatch(normalizePath(processNodeList(_NodeListToProcess))));
});
