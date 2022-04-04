import http from 'k6/http';
import {check, group} from 'k6';
import exec from 'k6/execution';
import {SharedArray} from 'k6/data';
import {Rate} from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {uuidv4} from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

let scenary = ''

export let options = {
  discardResponseBodies: true,  
  scenarios: {
    login_pass: {
      executor: 'ramping-arrival-rate',
      exec: 'login_pass',
      startRate: 1,
      preAllocatedVUs: 16,
      timeUnit: '10s',
      maxVUs: 16,
      stages: [
        { target: 16, duration: '10m'}         
      ],
    },/*
    groceries: {
      executor: 'ramping-arrival-rate',
      exec: 'groceries',
      startRate: 1,
      timeUnit: '5s',
      preAllocatedVUs: 16,
      maxVUs: 16,
      stages: [
        { target: 16, duration: '5s' },
      ],
    },*/
  },
};


const myFailRate = new Rate('errorRate');

function isOdd(num) { return num % 2;}

//>>>>>logtraceo<<<<<<
export function logtraceo( response, randomAddrp, rn )
{
    if(response.error_code != 0){
        console.log(`${rn}: Error: ${response.error_code}, User: ${randomAddrp.country}`)
        console.log(` ${JSON.stringify(response)}`)        
    }
    /*else {
        console.log(`${apitoken} ${rn}`) 
    }*/
}
export function metrics(resp)
{
    myFailRate.add(resp.status !== 200)
    check(resp, {"status was 200": (r) => r.status == 200})
} 
//GENERAL DATA
const addrdata = new SharedArray("address", function() {return papaparse.parse(open('add_all.csv'), { header: true }).data;});


let userdata, URL
userdata = URL = ""

//>>>>>STG<<<<<<
 userdata = new SharedArray("users", function() {return papaparse.parse(open('users_stg.csv'), { header: true }).data;});
 URL = 'https://stg-client-api-gateway.pedidosya.com'





let apitoken 
apitoken = ''
let restaurants = []
let rest_menu = []
let markets = []
let select_markets = []
let prod_mark = []
let menu_mark = []
let prod_selec = []
let randomUserp = {}
let randomAddrp = {}
let mark = {}
let token 
token = ''
let i 
i = 0
let rest
rest = ''
let restaurant = ''
//>>>>>LOGIC FLOW COMPLETO<<<<<<Comentario de control
export function logicflow(){    
    
    randomUserp = userdata[Math.floor(Math.random() * userdata.length)] 
    randomAddrp = addrdata[Math.floor(Math.random() * addrdata.length)]
    let countryid = randomAddrp.country //Los países que tienen un 3er elemento en el diccionario, ejecutan la request de wallet
    function GetGlobalent(c) {
        const countries = {
            "1": ["Uruguay","PY_uy"],
            "2": ["Chile","PY_cl", "CL"],
            "3": ["Argentina", "PY_ar", "AR"],
            "7": ["Perú", "PY_pe"],
            "8": ["Venezuela", "PY_ve", "VE"],
            "11": ["Panamá", "PY_pa", "PA"],
            "13": ["Ecuador", "PY_ec"],
            "15": ["Paraguay", "PY_py", "PY"],
            "16": ["Costa Rica", "PY_cr"],
            "17": ["Bolivia", "PY_bo", "BO"],
            "18": ["Republica Dominicana", "PY_do", "DO"],
            "19": ["El Salvador", "PY_sv"],
            "20": ["Nicaragua", "PY_ni"],
            "21": ["Guatemala", "PY_gt"],
            "22": ["Honduras", "PY_hn"],
        }
        return countries[c]
    }

    let device_id, session_id,  hashstring, time, resp_login, eurl, paymethods, paymethodsrest, menu, selectrest, allmenu, requestname, cant_op, pick
    device_id = session_id  = hashstring = time = resp_login = eurl = paymethods = paymethodsrest = allmenu = requestname = cant_op = pick =''
    session_id =  uuidv4()  
    device_id = (Math.random()*1e29).toString(36).slice(2)
    time = Date.now()/1000
    menu =  selectrest = 0 
    let headers={'Content-Type': 'application/json; charset=UTF-8', 'Accept-Encoding': 'gzip', 'User-Agent': 'okhttp/3.14.0', 'Peya-Request-Type': 'load-test', 'Peya-Device-ID': device_id, 'Peya-Trace-ID': uuidv4(), 'Peya-App-Version': '6.1.15.1', 'Peya-App-Platform': 'android', 'Origin': 'PedidosYa', 'X-Trace-ID': session_id, 'Peya-Global-Entity-ID': GetGlobalent(countryid)[1], 'Peya-Session-ID': session_id, 'Peya-Session-Timestamp': time,'Peya-Perseus-Client-Id':'no_perseus_client','Peya-Perseus-Hitmatch-ID':'no_perseus_hitmatch','Peya-Perseus-Session-ID': 'no_perseus_session'} 
   
    //-->>>>>appInit<<<<<--
    group('/mobile/v3/functions/appInit', function (){
        requestname = 'appInit'
        let resp_appinit = http.post(`${URL}/mobile/v3/functions/appInit?app=android&${hashstring}`, {}, {headers: headers, responseType: 'text', tags:{ name: '/v3/functions/appInit'}})    
        metrics(resp_appinit)
        logtraceo(resp_appinit, randomAddrp, requestname)    
        if(resp_appinit.error_code == 0){
            let at = JSON.parse(resp_appinit.body)
            let apitoken1 = jsonpath.query(at, 'LoginSystemResult.APIToken')
            let apt = `${apitoken1}`      
            apitoken = apt.replace('Bearer ','')
            headers['Authorization'] = apitoken           
            
        }
      });  
    //-->>>>>City<<<<<--
    group('/mobile/v2/locations/city', function (){
      requestname = 'city'
      let cityresp = http.get(`${URL}/mobile/v2/locations/city?lat=${randomAddrp.lat}&lng=${randomAddrp.lon}`, {headers: headers, tags:{ name: '/v2/location/city'}})
      metrics(cityresp)     
      logtraceo(cityresp, randomAddrp, requestname) 
    });           

    group( '/mobile/v1/users/login', function () {
      if(apitoken != undefined){
        requestname = 'logueo'         
        let payload = JSON.stringify({'countryId': randomAddrp.country, 'userName': randomUserp.email, 'password': randomUserp.pass})
        resp_login = http.post(`${URL}/mobile/v1/users/login?extendedInfo=true`, payload, {headers: headers, responseType: 'text', tags:{ name: '/v1/users/login'}})
        metrics(resp_login)
        logtraceo(resp_login, randomAddrp, requestname)
            if(resp_login.error_code == 0){
                let logueo = JSON.parse(resp_login.body)
                token = logueo['access_token']         
            }
        
      } 
    });
  
    group ('/mobile/v2/countries/randomAddrp.country/cities', function(){
      if(token != undefined){ 
        headers['Authorization'] = token
        paymethods ='&includePaymentMethods=Spreedly+UY%2CSpreedly+CL%2CSpreedly+AR%2CSpreedly+DO%2CSpreedly+BO%2CSpreedly+VE%2CSpreedly+PY%2CSpreedly+PA%2CSpreedly+NI%2CSpreedly+SV%2CSpreedly+EC%2CSpreedly+GT%2CSpreedly+HN%2CSpreedly+CR%2CSpreedly+PE%2CDecidir%2CTicket+Alimentaci%C3%B3n+Online%2CTicket+Restaurant+Online%2CVisaNet%2COCA%2CMastercard+UY%2CCreditel+UY%2CWebPay+CL'
        eurl = `${paymethods}&offset=0&max=50&offsetSwimlanes=0&maxSwimlanes=10&withFilters=true&gaTrackingId=UA-68934388-4&gaClientId=4e552f6a-3408-45fe-ba8c-313c5a24e70a`
        paymethodsrest ='&Spreedly+UY%2CSpreedly+CL%2CSpreedly+AR%2CSpreedly+DO%2CSpreedly+BO%2CSpreedly+VE%2CSpreedly+PY%2CSpreedly+PA%2CSpreedly+NI%2CSpreedly+SV%2CSpreedly+EC%2CSpreedly+GT%2CSpreedly+HN%2CSpreedly+CR%2CSpreedly+PE%2CDecidir%2CTicket+Alimentaci%C3%B3n+Online%2CTicket+Restaurant+Online%2CVisaNet%2COCA%2CMastercard+UY%2CCreditel+UY%2CAnda+UY%2CCreditos+Directos+UY%2CPasscard+UY%2CWebPay+CL'
    //-->>>>>cities<<<<<--
        requestname = 'cities'
        let cities = http.get(`${URL}/mobile/v2/countries/${randomAddrp.country}/cities`, {headers: headers, tags:{ name: '/mobile/v2/countries/countryId/cities'}})
        metrics(cities)
        logtraceo(cities, randomAddrp, requestname)
      }
    })
    group ('/v1/areas', function(){  
      requestname = 'areas'
      let areas = http.get(`${URL}/v1/areas?lat=${randomAddrp.lat}&lng=${randomAddrp.lon}&countryId=${randomAddrp.country}`, {headers: headers, tags:{ name: '/v1/areas'}})
      metrics(areas)
      logtraceo(areas, randomAddrp, requestname)
    })
    group ('/mobile/v2/users/myAddresses', function(){  
      requestname = 'myaddress'
      let myaddress = http.get(`${URL}/mobile/v2/users/myAddresses?countryId=${randomAddrp.country}`, {headers: headers, tags:{ name: '/mobile/v2/users/myAddresse'}})
      metrics(myaddress)     
      logtraceo(myaddress, randomAddrp, requestname)    
    })
    group ('/mobile/v2/ontimeorfree', function(){ 
      requestname = 'ontimeorfree1'
      let ontime1 = http.get(`${URL}/mobile/v2/ontimeorfree?countryId=${randomAddrp.country}&cityId=${randomAddrp.city}`, {headers: headers, tags:{ name: '/mobile/v2/ontimeorfree1'}})
      metrics(ontime1)
      logtraceo(ontime1, randomAddrp, requestname)
    })
    group ('/v1/wallet/${GetGlobalent(countryid)[2]}', function(){ 
      requestname = 'wallet'
      if (GetGlobalent(countryid)[2] != undefined) {
        let wallet = http.get(`${URL}/v1/wallet/${GetGlobalent(countryid)[2]}`, {headers: headers, tags:{ name: '/v1/wallet/country'}})
        metrics(wallet)
        logtraceo(wallet, randomAddrp, requestname)  
      }
    })
    group ('/v7/home', function(){ 
      requestname = 'home'  
      let url_enc = encodeURI(`${URL}/v7/home?component_suffix=_v2&area_id=${randomAddrp.area}&country_id=${randomAddrp.country}&lat=${randomAddrp.lat}&lng=${randomAddrp.lon}&city_name=${randomAddrp.cityname}`)
      let home = http.get(url_enc, {headers: headers, responseType: 'text', tags:{ name: '/v7/home'}})
      metrics(home)
      logtraceo(home, randomAddrp, requestname)
    })
    group ('/v7/home/lazy_load', function(){
      requestname = 'home_lazy'
      let home_lazy = http.get(`${URL}/v7/home/lazy_load?country_id=${randomAddrp.country}&lat=${randomAddrp.lat}&lng=${randomAddrp.lon}&area_id=${randomAddrp.area}&component_suffix=_v2&is_pickup=${pick}`, {headers: headers, tags:{ name: '/v7/home/lazy_load'}})
      metrics(home_lazy)
      logtraceo(home_lazy, randomAddrp, requestname)
    })
    group ('/mobile/v6/functions/countries/randomAddrp.country/initialData', function(){
      requestname = 'initialdata'
      let initialdata = http.get(`${URL}/mobile/v6/functions/countries/${randomAddrp.country}/initialData?includeFoodCategory=true&includeBusinessCategory=true`, {headers: headers, tags:{ name: '/mobile/v6/functions/countries/${country_idL}/initialData'}})
      metrics(initialdata)
      logtraceo(initialdata, randomAddrp, requestname)   
    })
    group ('/v2/plans', function(){
      requestname = 'plans'
      let plans = http.get(`${URL}/v2/plans?countryId=${randomAddrp.country}`, {headers: headers, tags:{ name: '/v2/plans'}})
      metrics(plans)
      logtraceo(plans, randomAddrp, requestname)
    })
    group ('/mobile/v5/shopList (Groceries)', function(){
      requestname = 'respshoplist2'          
      let respshoplistg = http.get(`${URL}/mobile/v5/shopList?point=${randomAddrp.lat}%2C${randomAddrp.lon}&country=${randomAddrp.country}&area=${randomAddrp.area}${eurl}&businessType=GROCERIES`, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v5/shoplist'} })
      metrics(respshoplistg)
      logtraceo(respshoplistg, randomAddrp, requestname)
      if(respshoplistg.error_code == 0){
        let sg = respshoplistg.body
        let shoplistgorc = JSON.parse(sg)
        let allmark = jsonpath.query(shoplistgorc, 'list.data[*].id')
        markets.push(allmark)      

        for (i = 0; i <= 1; i++){
          select_markets.push(allmark[i])     
        }
      } 
    })
    group ('/v1/promotions/shop-list/banners', function(){
      requestname = 'promotions'          
      let promotions = http.get(`${URL}/v1/promotions/shop-list/banners?businessType=GROCERIES&lat=${randomAddrp.lat}&lon=${randomAddrp.lon}`, {headers: headers, tags:{ name: '/v1/promotions/shop-list/banners'} })
      metrics(promotions) 
      logtraceo(promotions, token, requestname)
    })
    group ('/mobile/v3/restaurants/mark', function(){
      if(select_markets.length != 0){
        for (i = 0; i < select_markets.length; i++){
          mark = select_markets[i]
          if(mark != undefined){
            requestname = 'respmark'
            let respmark = http.get(`${URL}/mobile/v3/restaurants/${mark}?point=${randomAddrp.lat}%2C${randomAddrp.lon}${paymethodsrest}&newVoucherVersion=true`, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v3/restaurants/idrest'}})         
            metrics(respmark)
            logtraceo(respmark, randomAddrp, requestname)
            if(respmark.error_code == 0){            
              let mk = respmark.body
              let markmenu = JSON.parse(mk)
              allmenu = jsonpath.query(markmenu, '$.restaurant.menu.id')
              menu_mark.push(allmenu)
            }
          }        
        }
      }
    })
    group ('/v1/vendors-capacities/mark', function(){
      if(mark != undefined){
        requestname = 'vendorcap'   
        let vendorcap = http.get(`${URL}/v1/vendors-capacities/${mark}?lat=${randomAddrp.lat}&lng=${randomAddrp.lon}`, {headers: headers, tags:{ name: '/v1/vendors-capacities/market'} })
        metrics(vendorcap)
        logtraceo(vendorcap, randomAddrp, requestname)
      }
    })
    group ('/v1/branded-banners/${mark}/banners', function(){
      if(mark != undefined){
        requestname = 'branded'
        let branded = http.get(`${URL}/v1/branded-banners/${mark}/banners`, {headers: headers, tags:{ name: '/v1/branded-banners/market/banners'} })
        metrics(branded)
        logtraceo(branded, randomAddrp, requestname)
      }  
    })
    group ('/mobile/v3/catalogues/menu_mark[0]/sections', function(){
      if(menu_mark.length != 0 && mark != undefined){        
        requestname = 'respsectionsg'
        let respsectionsg = http.get(`${URL}/mobile/v3/catalogues/${menu_mark[0]}/sections?partnerId=${mark}&offset=0&max=20&maxProducts=12&branded=true&excludeProducts=true`, {headers: headers, responseType: 'text', tags:{ name: 'mobile/v2/catalogues/menu/sections'}})
        metrics(respsectionsg)
        logtraceo(respsectionsg, randomAddrp, requestname)
        if(respsectionsg.error_code == 0){
          let cs = respsectionsg.body
          let menusec = JSON.parse(cs)
          let ms = jsonpath.query(menusec, 'data[*].id')
          let rc = Math.floor(Math.random() * menusec['data'].length)             
          prod_mark.push(ms[rc])
        }
      }
    })
    group ('/mobile/v3/menusections/prod_mark[0]/products', function(){
      if(prod_mark.length != 0 && mark != undefined){
        requestname = 'respmensec'
        let respmensec = http.get(`${URL}/mobile/v3/menusections/${prod_mark[0]}/products?partnerId=${mark}&offset=0&max=44&sort=`, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v3/menusections/prod_mark/products'}})
        metrics(respmensec)
        logtraceo(respmensec, randomAddrp, requestname)
        if(respmensec.error_code == 0){
          let rs = respmensec.body
          let prodsec = JSON.parse(rs)
          let ps = jsonpath.query(prodsec, 'data[*].id')
          let rps = Math.floor(Math.random() * prodsec['data'].length)             
          prod_selec.push(ps[rps])
          //console.log("Producto" + prod_selec)
      }
      }
    })
    group ('/v1/catalogues/${menu_mark[i]}/sections/all', function(){
      if(mark != undefined){
        requestname = 'sectionsall'
        let sectionsall = http.get(`${URL}/v1/catalogues/${menu_mark[0]}/sections/all?partnerId=${mark}`, {headers: headers,  tags:{ name: '/v1/catalogues/menu/sections/all'}})
        metrics(sectionsall)
        logtraceo(sectionsall, randomAddrp, requestname)
      }
    })
    group ('/mobile/v3/products/prod_selec[1]/optionGroups', function(){
      if (prod_selec.length != 0 && prod_selec[0] != undefined && mark != undefined) {
        requestname = 'optionmarket'
        let optionmarket = http.get(`${URL}/mobile/v3/products/${prod_selec[0]}/optionGroups?restaurantId=${mark}&max=all`, {headers: headers, tags:{ name: '/mobile/v3/products/prod/optionGroups'}})
        metrics(optionmarket)
        logtraceo(optionmarket, randomAddrp, requestname) 
      }
    })
    group ('/mobile/v5/shopList (Rest)', function(){
      requestname = 'respshoplist3'          
      let respshoplistrest = http.get(`${URL}/mobile/v5/shopList?point=${randomAddrp.lat}%2C${randomAddrp.lon}&country=${randomAddrp.country}&area=${randomAddrp.area}${eurl}&businessType=RESTAURANT`, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v5/shoplist'} })
      metrics(respshoplistrest)
      logtraceo(respshoplistrest, randomAddrp, requestname)  
        if(respshoplistrest.error_code == 0){
          let sh = respshoplistrest.body
          let shoplistrest = JSON.parse(sh)
          let allrests = jsonpath.query(shoplistrest, 'list.data[*].id')
          let ri = Math.floor(Math.random() * shoplistrest['list']['data'].length)       
          restaurants.push(allrests[ri])      
          for (let i = 0; i < 3; i++){    
            restaurants.push(allrests[i])     
          }
        }  
    })
    group ('/mobile/v3/restaurants/rest', function(){
      if(restaurants.length != 0){
        rest = restaurants[0]
        if(rest != undefined){
          requestname = 'resprest'
          let resprest = http.get(`${URL}/mobile/v3/restaurants/${rest}?point=${randomAddrp.lat}%2C${randomAddrp.lon}${paymethodsrest}&newVoucherVersion=true`, {headers: headers, responseType: 'text', tags:{ name: '/mobile/v3/restaurants/idrest'}})         
          metrics(resprest)
          logtraceo(resprest, randomAddrp, requestname)
          if(i==0 && resprest.error_code == 0){
            let me = resprest.body
            let restmenu = JSON.parse(me)
            menu = jsonpath.query(restmenu, '$.restaurant.menu.id')
            
          }
        }
      }
    })
    group ('/v1/vendors/${rest}/config', function(){
      requestname = 'vendors_config'
      let vendors_config = http.get(`${URL}/v1/vendors/${rest}/config`, {headers: headers, tags:{ name: '/v1/vendors/rest_id/config'}})
      metrics(vendors_config)
      logtraceo(vendors_config, randomAddrp, requestname)
    })
    group ('/v1/distances/vendors', function(){
      requestname = 'distances_vendors'
      let payload_dist = JSON.stringify({'origin':{'latitude': randomAddrp.lat,'longitude':randomAddrp.lon},'vendors':[rest]})         
      let distances_vendors = http.post(`${URL}/v1/distances/vendors`, payload_dist, {headers: headers, tags:{ name: '/v1/distances/vendors'}})
      metrics(distances_vendors)
      logtraceo(distances_vendors, randomAddrp, requestname)
    })
    group ('/v1/optIns/randomAddrp.country', function(){
      requestname = 'optIns'
        let optIns = http.get(`${URL}/v1/optIns/${randomAddrp.country}`, {headers: headers, tags:{ name: '/v1/optIns/country_id'}})
        metrics(optIns)
        logtraceo(optIns, randomAddrp, requestname)
    })
    group ('/mobile/v2/countries/randomAddrp.country/time', function(){
      requestname = 'countries'
      let countries = http.get(`${URL}/mobile/v2/countries/${randomAddrp.country}/time`, {headers: headers, tags:{ name: '/mobile/v2/countries/country_id/times'}})
      metrics(countries)
    })
    group ('/mobile/v2/restaurants/restaurant/upselling', function(){
      requestname = 'upselling'
      let upselling = http.get(`${URL}/mobile/v2/restaurants/${rest}/upselling?extended=true&countryId=${randomAddrp.country}&branded=true`, {headers: headers, tags:{ name: '/mobile/v2/restaurants/restaurant/upselling'}})
      metrics(upselling)
      logtraceo(upselling, randomAddrp, requestname)
    })
    group ('/v1/niles/partners/${rest}/menus', function(){
      if(rest != undefined){
        requestname = 'menu'
        let respmenu = http.get(`${URL}/v1/niles/partners/${rest}/menus?isJoker=false&occasion=delivery`, {headers: headers, responseType: 'text', tags:{ name: '/v1/niles/partners/restaurant/menus'}})     
        metrics(respmenu)
        logtraceo(respmenu, randomAddrp, requestname) 
      }
    })
    group ('/v1/niles/users/preferred-dishes/rest', function(){
      requestname = 'preferred_dishes'
      let preferred_dishes = http.get(`${URL}/v1/niles/users/preferred-dishes/${rest}?occasion=delivery`, {headers: headers, tags:{ name: '/v1/niles/users/preferred-dishes/restaurant'}})     
      metrics(preferred_dishes)
      logtraceo(preferred_dishes, randomAddrp, requestname)
    })      
}

export function login_pass() {
  scenary = 'logueo', 
  logicflow() 
}
