const express = require('express'),
    app = express(),
    xray = require('x-ray')();

function search(term) {
    const config = {
        seek: {
            url: `https://www.seek.com.au/${term}-jobs/in-All-Melbourne-VIC`,
            element: '[data-automation="totalJobsCount"]'
        },
        indeed: {
            url: `https://au.indeed.com/jobs?q=${term}&l=melbourne`,
            element: 'div#searchCount'
        },
        careerone: {
            url: `http://jobs.careerone.com.au/search/?q=${term}&where=Melbourne__2C-VIC`,
            element: 'h2.page-title'
        }
    }

    return new Promise((resolve, reject) => {
        const allPromises =
            Object.keys(config)
                .map(key => {
                    return new Promise((resolve, reject) => {
                        return xray(config[key].url, config[key].element)((err, count) => {
                            if (err) {
                                console.log(err);
                                reject(err)
                            }
                            resolve({
                                [key]: {
                                    count: count,
                                    url: config[key].url
                                }
                            })
                        }
                        )
                    })
                })

        Promise.all(allPromises)
            .then(r => { resolve({ [term]: r }) })
            .catch(e => console.log(e))
    })
}

app.get('/', (req, res) => {
    const keywords = ['junior-web-developer', 'web-developer-intern', 'react']

    Promise.all(keywords.map(keyword => search(keyword)))
        .then(r => res.send(r))
        .catch(e => console.log(e))


})


app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
