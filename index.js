const fs = require('fs')
const path = require('path')

function makeConnection(name, password) {
    return `[connection]
id=${name}
type=wifi
interface-name=wlo1

[wifi]
mode=infrastructure
ssid=${name}

[wifi-security]
auth-alg=open
key-mgmt=wpa-psk
psk=${password}

[ipv4]
method=auto

[ipv6]
addr-gen-mode=stable-privacy
method=auto

[proxy]        
`
}

function importPasswords() {
    const passwordFilename = process.argv[2]
    const passwordFile = fs.readFileSync(passwordFilename).toString('utf-8')
    const lines = passwordFile.split('\n')
    const outDir = 'system-connections' 

    try {
        fs.mkdirSync(outDir)
    } catch (e) {
        if (e.code !== 'EEXIST') throw e
    }

    /*
     * Expect the input as a CSV file with the following format:
     * <not used>,<name>,AirPort,<password>
     */
    for (const line of lines) {
        if (line === '') {
            continue
        }
        const fields = line.split(',')
        const name = fields[1]
        const password = fields[3]
        const sanitizedName = name.replace(/\//, '')
        const extension = '.nmconnection'
        const connFilename = path.join(outDir, `${sanitizedName}${extension}`)
        const connFileData = makeConnection(name, password)
        
        fs.writeFileSync(connFilename, connFileData)
    }
}

importPasswords()