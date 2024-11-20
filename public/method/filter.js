const fs = require('fs')
const type = 'Window'
const method = JSON.parse(fs.readFileSync(`./public/method/origin/${type}.json`, 'utf8'))
const filted = {}
for (const key in method) {
    if(key == '_count')
        filted[key] = method[key]
    if(method[key].note != ''){
        if(method[key].args && method[key].args[0] && method[key].args[0].note == ''){
            delete method[key].args
        }
        filted[key] = method[key]
    }
}
fs.writeFileSync(`./public/method/filted/${type}Filted.json`, JSON.stringify(filted, null, 4))
