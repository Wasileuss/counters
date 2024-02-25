"use strict"

// Інструкція з використання модулю

// Просто добавляємо необхідний атрибут до вашого коду html і працює як звичайний лічильник
// Приклад запису
//						1)    2)
/* <span data-counter=" 1s , 2px">30</span> */

// Де:

// 1) Час виконання анімації в секундах за змовченням = 1s
// 2) Відступ безпеки якщо поруч є текст і його трясе за змовченням = 0

// Приклад запису якщо якийсь із параметрів вказувати не треба

/* <span data-counter="  ,1px">30</span> */

// ну або якщо підходять всі значення за змовченням вказуємо просто атрибут

/* <span data-counter >30</span> */

//========================================================================================================================================================

// Додаткові опції

// 1)Лічильник з розділовим знаком

// Добавляємо атрибут data-separator

/* <span data-separator data-counter=" 1s , 2px">16537</span> */

// За змовченням цей метод визначає регіон в якому знаходиться користувач, та підставляє той розділовий знак який використовується в цьому регіоні

// Є можливість підставити власний розділовий знак
//												    †
/* <span data-separator data-counter=" 1s , 2px">165,37</span> */

// Просто в значення лічильника підставляємо розділовий знак в будь яке місце 165,37 або 16.537 будь який знак

//========================================================================================================================================================

// 2) Повторення анімації при повторній появі елементу у вʼюпорті

// За змовченням анімація відбудеться тільки один раз при появі елементу
// Добавляємо атрибут data-repeat

/* <span data-counter data-repeat>30</span> */
//========================================================================================================================================================
// 3) Лічильник із свг

// Для батьківського елементу куди хочемо вставити свг задати атрибут data-circle-wrap

//						     1)        2)    3)    4)
/* <div data-circle-wrap="#40DDB6, #6B77E5, 3px, full"> */

// Де:

// 1) Колір stroke для свг
// 2) Колір fill для свг
// 3) Товщина stroke для свг
// 4) Якщо треба заповнення свг на 100%, пишемо full або будь що, що поверне true, за змовченням буде заповнюватись на вказане значення у відсотках

class Counter {
	constructor(counterAtr = "data-counter") {
		this.counterAtr = counterAtr
	}

	// Функція callback для observer
	callBackFunc(entries) {
		entries.forEach((entry) => {
			const counterEl = entry.target
			const counter = this.counters.find((counter) => counter.counterEl === counterEl)

			if (entry.isIntersecting) {
				if (!counter.isAnimated) {
					counter.startCounter()

					if (!counter.repeat) {
						counter.isAnimated = true
						this.observer.unobserve(counterEl)
					}
				}
			}
		})
	}

	// Стврення observer
	observe(element) {
		const options = {
			root: null,
			rootMargin: "0px 0px 0px 0px",
			threshold: 0.5,
		}

		this.observer = new IntersectionObserver((entries) => this.callBackFunc(entries), options)

		this.observer.observe(element)
	}

	// ініціалізація лічильника
	counterInit() {
		const counterElements = document.querySelectorAll(`[${this.counterAtr}]`)
		this.counters = []

		if (counterElements) {
			counterElements.forEach((counter) => {
				const newCounter = new CounterInstance(counter, this.counterAtr)
				this.counters.push(newCounter)
				newCounter.initCounter()

				this.observe(counter)
			})
		}
	}
}

//========================================================================================================================================================

class CounterInstance {
	constructor(
		counterEl,
		counterAtr,
		parentAtrName = "data-circle-wrap",
		repeatAtrName = "data-repeat",
		separatorAtrName = "data-separator"
	) {
		this.counterAtr = counterAtr
		this.parentAtrName = parentAtrName
		this.repeatAtrName = repeatAtrName
		this.separatorAtrName = separatorAtrName
		this.counterEl = counterEl

		// Змінна для роботи логіки з повторною анімацією
		this.isAnimated = false
		this.parentEl = this.counterEl.closest(`[${this.parentAtrName}]`)
	}

	// Метод для обчислення ширини лічильника, та якщо потрібно, задання відстані безпеки з переводом у rem
	setWidth() {
		const width = this.counterEl.offsetWidth
		this.counterEl.style.minWidth = (width + this.range) / 16 + "rem"
	}

	// Метод отримання неохідних для роботи лічильника значень
	getCounterValues() {
		const counterValues = this.counterEl.getAttribute(this.counterAtr)

		// Приймаємо значення самого лічильника
		let custValue = this.counterEl.textContent || "0"

		// Приймаємо дані з атрибуту, перевіряємо, та привласнюємо значення за змовченням, якщо дані не визначені
		const [customTime, customRange] = counterValues
			.split(",")
			.map((value) => parseFloat(value.trim(), 10))

		this.time = customTime * 1000 || 1000

		this.range = customRange || 0

		if (this.counterEl.hasAttribute(this.separatorAtrName)) {
			// Для лічильника з розділовим знаком своя логіка отримання цього значення, для цього і умова
			this.initSeparator(custValue)
		} else this.value = parseInt(custValue)

		// Змінна для роботи повторення анімації
		this.repeat = this.counterEl.hasAttribute(this.repeatAtrName) ? true : false
	}

	// Метод отримання значень для лічильника з розділовим знаком
	initSeparator(custValue) {
		// Логіка знаходження розділового знаку відповідно до регіону користувача, або задання знаку який вказав користувач
		const formatter = new Intl.NumberFormat()
		const parts = formatter.formatToParts(1000)
		const localSeparator = parts.find((part) => part.type === "group")
		const matchResult = custValue.match(/[^\d]/)

		let separator

		if (matchResult) {
			separator = matchResult[0]
			this.value = custValue.split(separator).join("")
		} else this.value = custValue

		this.separator = separator || localSeparator.value
	}

	animateCounter() {
		// деталі у відео Жені https://www.youtube.com/watch?v=MSP-MP_TVf4
		let current = 0
		let start = null

		const step = (timestamp) => {
			if (!start) start = timestamp
			const progress = Math.min((timestamp - start) / this.time, 1)

			if (this.counterEl.hasAttribute(this.separatorAtrName)) {
				this.counterEl.textContent = this.formatNumberWithSeparator(progress * (current + this.value))
			} else this.counterEl.textContent = Math.floor(progress * (current + this.value))

			if (progress < 1) {
				requestAnimationFrame(step)
			}
		}

		requestAnimationFrame(step)
	}

	// Отримуємо число з лічильника і перед його записом в html вставляємо розділовий знак в число
	formatNumberWithSeparator(number) {
		const integerPart = number.toFixed(0)

		// легенький регулярний вираз :))
		return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.separator)
	}

	// Перевірка лічильник з свг чи ні
	startCounter() {
		if (this.parentEl) {
			this.setAnimationProperties()
		}

		this.animateCounter()
	}
	// метод привласнення властивостей анімації

	setAnimationProperties() {
		this.offsetValue = this.totalLength - (this.totalLength * this.value) / this.maxValue

		// перезапис offsetValue svg при адаптиві
		if (this.styleElement) {
			this.styleElement.innerText = `@keyframes ${this.animName} {
					100% {
					  stroke-dashoffset: ${this.offsetValue}; 
					}
				  }`
			this.circleElement.style.animation = ""

			setTimeout(() => {
				this.circleElement.style.animation = `${this.animName} ${this.time}ms linear forwards`
			}, 20)
			return
		}

		// Створення унікального імені для анімації та елементу стилів
		this.animName = `anim-${Math.floor(Math.random() * 1e6)}`

		const keyframesRule = `@keyframes ${this.animName} {
				100% {
				  stroke-dashoffset: ${this.offsetValue}; 
				}
			  }`

		this.styleElement = document.createElement("style")
		this.styleElement.append(keyframesRule)
		this.styleElement.classList.add(this.animName)
		document.head.appendChild(this.styleElement)

		this.circleElement.style.animation = `${this.animName} ${this.time}ms linear forwards`
	}

	// Ну тут просто запис стилів з переводом в rem
	setStyles() {
		this.totalLength = this.circleElement.getTotalLength()
		this.svgElement.style.position = "absolute"
		this.svgElement.style.top = "0"
		this.svgElement.style.left = "0"
		this.svgElement.style.width = "100%"
		this.svgElement.style.height = "100%"
		this.svgElement.style.fill = this.fill
		this.svgElement.style.stroke = this.stroke
		this.svgElement.style.strokeWidth = this.strokeWidth / 16 + "rem"
		this.circleElement.style.strokeDasharray = this.totalLength
		this.circleElement.style.strokeDashoffset = this.totalLength
	}

	// Метод задання розмірів для свг зображення відносно батьківського елементу з переводом в rem
	setSvgSize() {
		const attributes = ["cx", "cy", "r"]
		this.parentElWidth = this.parentEl.offsetWidth

		attributes.forEach((attr) => {
			if (attr === "r") {
				this.circleElement.setAttribute(
					attr,
					(this.parentElWidth - this.strokeWidth) / 2 / 16 + "rem"
				)
			} else {
				this.circleElement.setAttribute(attr, this.parentElWidth / 2 / 16 + "rem")
			}
		})
	}

	// Метод отримання параметрів з атрибуту для свг, з усіма перевірками та привласненні значень за змовченням
	getSvgParams() {
		const svgValues = this.parentEl.getAttribute(this.parentAtrName)

		const [custFill, custStroke, custStrokeWidth, fullFilling] = svgValues
			.split(",")
			.map((value) => value.trim())

		// Отримуємо параметри з атрибуту, якщо не задані, присвоюємо значення за змовченням
		this.fill = custFill || "#000"
		this.stroke = custStroke || "#ff0000"
		this.strokeWidth = parseFloat(custStrokeWidth, 10) || 3

		// визначаємо тип заповнення свг, повний чи на певний відсоток
		this.maxValue = fullFilling ? this.value : 100
	}

	// Метод безпосередньо створення свг зображення
	svgCreator() {
		this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")

		this.circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		this.svgElement.appendChild(this.circleElement)

		this.circleElement.setAttribute("stroke-linecap", "round")

		this.parentEl.prepend(this.svgElement)
	}

	// Ну і власне ініціалізація створення свг
	svgInit() {
		this.parentEl.style.position = "relative"
		this.getSvgParams()
		this.svgCreator()

		// Иніціалізація Resize Observer
		const resizeObserver = new ResizeObserver(() => {
			this.setSvgSize()
			this.setStyles()
			this.setAnimationProperties()
		})

		resizeObserver.observe(this.parentEl)
	}

	// Ініціалізація лічильників та свг при створенні екземпляру класу
	initCounter() {
		this.getCounterValues()
		this.setWidth()

		if (this.parentEl) {
			this.svgInit()
		}
	}
}

export const counter = new Counter()
