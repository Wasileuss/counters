function checkInit(identifier, className, methodName, parentAtrName) {
	if (!identifier) {
		throw new Error("identifier is not defined")
	}

	let elements
	if (identifier.includes(".")) {
		elements = document.querySelectorAll(identifier)
	} else {
		elements = document.querySelectorAll(`[${identifier}]`)

		if (elements.length && className && methodName) {
			elements.forEach((element) => {
				className[methodName](element, identifier, parentAtrName)
			})
		}
	}

	return elements && elements.length ? elements : null
}