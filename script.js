import http from 'k6/http';
import {SharedArray} from 'k6/data';
import {Rate} from 'k6/metrics';
import {check} from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {uuidv4} from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js';

//Ramp up based on iterations (ramping-arrival-rate). With this type of executors, the load emission is not conditioned by the performance of the application under test.
export let options = {
    //With "discardResponseBodies: true" the response body is discarded by default and is only enabled to parse and correlate data when "responseType: 'text'" is included in the request. This improves the performance of the script.
    discardResponseBodies: true,  
    //Multiple scenarios can be declared in the same script, and each one can independently execute a different JavaScript function.Every scenario can use a distinct VU and iteration scheduling pattern.
    scenarios: {
        login_pass: {
            executor: 'ramping-arrival-rate',
            exec: 'login_pass',
            startRate: 1,
            preAllocatedVUs: 5,
            timeUnit: '20s',
            maxVUs: 5,
            stages: [
                { target: 2, duration: '30s' },  
                { target: 2, duration: '30s' },                  
            ],
        },
        login_anonymous: {
            executor: 'ramping-arrival-rate',
            exec: 'login_anonymous',
            startRate: 1,
            timeUnit: '20s',
            preAllocatedVUs: 5,
            maxVUs: 5,
            stages: [
                { target: 2, duration: '30s' },
                { target: 1, duration: '30s' }
            ],
        },
    },
};

//Metrics
const myFailRate = new Rate('errorRate');

export function metrics(resp)
{
    myFailRate.add(resp.status !== 200)
    check(resp, {"status was 200": (r) => r.status == 200})
} 

//Data set
const URL = 'https://www.blazedemo.com'

let scenary
scenary = ''

export function logicflow(){ 

  let headers={'Accept-Language': 'en-US,en;q=0.5', 'Upgrade-Insecure-Requests': 1, 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0', 'Accept-Encoding': 'gzip, deflate', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'}  

  let fist_page = http.get(`${URL}/`, {headers: headers, tags:{ name: '/'}})
            metrics(fist_page)

  headers['Referer']='https://blazedemo.com/'
  headers['Origin']='https://blazedemo.com/'
  headers['Content-Type']='application/x-www-form-urlencoded'

  let reserve = http.post(`${URL}/reserve.php`, {'fromPort': 'Boston', 'toPort': 'New York'}, {headers: headers, responseType: 'text', tags:{ name: '/reserve'}})    
        metrics(reserve) 
  let purchase = http.post(`${URL}/purchase.php`, {'flight': '234', 'price': 'New 432.98', 'airline': 'United Airlines', 'fromPort': 'Boston', 'toPort': 'New York' }, {headers: headers, tags:{ name: '/purchase'}})    
        metrics(purchase) 
  let confirmation = http.post(`${URL}/confirmations.php`, {'_token': '', 'inputName': 'Luis', 'address': 'Río Branco', 'city': 'Montevideo', 'state': 'Montevideo', 'zipCode': '11100', 'cardType': '523641789658', 'creditCardMonth': 11, 'creditCardYear': 2017, 'nameOnCard': 'OCA', 'rememberMe': 'on'  }, {headers: headers, responseType: 'text', tags:{ name: '/confirmation'}})    
        metrics(confirmation) 

}

export function login_pass() {
    scenary = 'logueo', 
    logicflow() 
}
export function login_anonymous() {
    scenary = 'anonymous'
    logicflow() 
}
