// 页面导航前拦截
chrome.webNavigation.onBeforeNavigate.addListener(function(obj) {
    var url = new URL(obj.url)
    var domain = convertToDomain(url.hostname)
    chrome.storage.sync.get(['sites'], function(value) {
        var sites = value['sites']
        if (sites === undefined) {
            return
        }
        console.log("Currently blocked sites:", JSON.stringify(sites))
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] === domain) {
                // 跳转拦截页面
                var blockpage = 'chrome-extension://' + chrome.runtime.id + '/blocked.html?origin=' + encodeURIComponent(obj.url)
                chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
                    if (tabs.length > 0) {
                        chrome.tabs.update(tabs[0].id, {url: blockpage})
                    }
                })
                return
            }
        }
    })
})

// 通配二级域名
function convertToDomain(hostname) {
    var arr = hostname.split('.')
    if (arr.length <= 2) {
        return hostname
    }
    return arr.slice(arr.length - 2).join('.')
}