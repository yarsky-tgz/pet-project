const EventEmitter = require('events')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')

class ReadlineInterface extends EventEmitter {
    constructor(input) {
        super()
        let brokenString
        input.on('data', (chunk) => {
            if (chunk.indexOf('\n') !== -1) {
                chunk.split('\n').forEach((element, index, array) => {
                    if (index === array.length -1) {
                        brokenString = element
                    }
                    else if (index === 0) {
                        this.emit('line', brokenString + element)
                    }
                    else {
                        this.emit('line', element)
                    }
                })
            }
            else {
                brokenString += chunk
            }
        })

            .on('end', () => {
                this.emit('line', brokenString)
                this.emit('close')
            })
    }
}

const readline = {
    createInterface({ input }) {
        return new ReadlineInterface(input)
    }
};

(async () => {
    const data = await fetch('http://lib.ru/RUFANT/')
        .then(response => response.body.pipe(iconv.decodeStream('koi8-r')))
    const regular = /(?<=<small><b>)(?<type>.*?)(?=<\/b>).*?(?<=<\/small><\/tt> <A HREF=)(?<uri>.*?)(?=\/>).*?(?<=\/><b>)(?<name>.*?)(?=<\/b><\/A>)/
    const autors = []
    const rl = readline.createInterface({ input: data });
    rl.on('line', (input) => {
        const result = regular.exec(input)
        if (result) {
            const { name, type, uri } = result.groups
            const newObject = { name, type, uri }
            autors.push(newObject)
        }
    })
        .on('close', () => console.log(autors))
})()