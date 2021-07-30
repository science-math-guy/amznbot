const got = require('got');
const HTMLParser = require('node-html-parser');
const prompt = require('prompt-sync')();
const chalk = require('chalk');
const { Webhook, MessageBuilder } = require('discord-webhook-node');

console.log(chalk.cyanBright('AMZNBOT'));

// https://www.amazon.com/Flagship-HP-Chromebook-Anti-Glare-Processor/dp/B08PDTLK1Q,https://www.amazon.com/Canon-Rebel-T7-18-55mm-II/dp/B07C2Z21X5/

const hook = new Webhook('https://discord.com/api/webhooks/870635337125359697/00X0q-tI4Uvtqq2x7jVqRYGRGayDlrl5Z7A_MDB4-B9RI-CcxAce6fRzc49mDRvDpGDO');
 
const embed = new MessageBuilder()
    .setTitle('Amazon Monitor')
    .setColor('#90ee90')    

async function Monitor(productLink) {
    let myheaders = {
        'connection': 'keep-alive',
        'sec-ch-ua': 'Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92',
        'sec-ch-ua-mobile': '?0',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        'accept': 'text/html,application\/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en,q=0.9',
        'rtt': 50,
        'ect': '4g',
        'downlink': 10
    };
    const response = await got(productLink, {
        headers: myheaders
    });

    if (response && response.statusCode == 200) {
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('#availability');
        if (availabilityDiv) {
            let productImageUrl = root.querySelector('#landingImage').getAttribute('src');
            let productName = productLink.substring(productLink.indexOf('/com') + 4, productLink.indexOf('/dp'));
            let stockText = availabilityDiv.childNodes[1].innerText.toLocaleLowerCase();
            if (stockText == 'out of stock') {
                console.log(chalk.redBright(`${productName}: OUT OF STOCK`));
            } else {
                embed.setThumbnail(productImageUrl);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'IN STOCK', false);
                hook.send(embed);
                console.log(chalk.greenBright(`${productName}: IN STOCK`));
            }
        }
    }
    await new Promise(r => setTimeout(r,8000));
    Monitor(productLink);
    return false;
}

async function Run() {
    let productLinks = prompt('Enter the links to monitor (separate by commas): ');
    let productLinksArr = productLinks.split(',');
    for (var i = 0; i < productLinksArr.length; i++) {
        productLinksArr[i] = productLinksArr[i].trim();
    }

    var monitors = [];

    productLinksArr.forEach(link => {
        var p = new Promise((resolve, reject) => {
            resolve(Monitor(link));
        }).catch(err => console.log(err));

        monitors.push(p);
    });

    await Promise.allSettled(monitors);

    // if (productLink.indexOf('http') >= 0) {
    //     console.log('Now monitoring ' + productLink);
    // } else {
    //     console.log('ERROR, Invalid URL!')
    // }
    // Monitor(productLink);
}

Run();