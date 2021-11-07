var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import EventEmitter from 'events';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
class ReadlineInterface extends EventEmitter {
    constructor(input) {
        super();
        let brokenString;
        input.on('data', (chunk) => {
            if (chunk.indexOf('\n') !== -1) {
                chunk.split('\n').forEach((element, index, array) => {
                    if (index === array.length - 1) {
                        brokenString = element;
                    }
                    else if (index === 0) {
                        this.emit('line', brokenString + element);
                    }
                    else {
                        this.emit('line', element);
                    }
                });
            }
            else {
                brokenString += chunk;
            }
        })
            .on('end', () => {
            this.emit('line', brokenString);
            this.emit('close');
        });
    }
}
const readline = {
    createInterface({ input }) {
        return new ReadlineInterface(input);
    },
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fetch('http://lib.ru/RUFANT/')
        .then((response) => {
        if (response && response.body)
            return response.body.pipe(iconv.decodeStream('koi8-r'));
    });
    const regular = /(?<=<small><b>)(?<type>.*?)(?=<\/b>).*?(?<=<\/small><\/tt> <A HREF=)(?<uri>.*?)(?=\/>).*?(?<=\/><b>)(?<name>.*?)(?=<\/b><\/A>)/;
    const autors = [];
    const rl = readline.createInterface({ input: data });
    rl.on('line', (input) => {
        const result = regular.exec(input);
        if (result) {
            const { name, type, uri } = result.groups;
            const newObject = { name, type, uri };
            autors.push(newObject);
        }
    })
        .on('close', () => console.log(autors));
}))();
