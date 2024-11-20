const target = bot.entity
const data = {}
data['_count'] = 0
let count = 0
for (const key in target) {
    if(key[0] == '_')
        continue
    if (Object.prototype.hasOwnProperty.call(target, key)) {
        // console.log(key)
        const method = {
            note:'',
            return:{
                type: target[key] ? target[key].constructor.name : '',
                note:''
            },
            args:[
                {
                    type:'',
                    note:''
                }
            ]
        }
        data[key] = method
        count ++
    }
}
data['_count'] = count
console.log(JSON.stringify(data, null, 4))
// require('fs').writeFileSync('./public/method/BlockOrigin.json', JSON.stringify(data, null, 4))
