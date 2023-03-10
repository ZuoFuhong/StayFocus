document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
        if (tabs.length > 0) {
            var url = tabs[0].url
            // 阻塞页面
            if (url.startsWith('chrome-extension://' + chrome.runtime.id)) {
                document.getElementById('block').style.display = 'none'
                return
            }
            // 开发者页面
            if (url.startsWith('chrome')) {
                document.getElementById('container').style.display = 'none'
                return
            }
            // 隐藏解除按钮
            document.getElementById('unblock').style.display = 'none'
        }
    })
})  

// 加入阻塞
document.getElementById('block').addEventListener('click', function() {
    chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
        // 提取当前页面 hostname
        if (tabs.length > 0) {
            var url = tabs[0].url
            // 排除页面
            if (url.startsWith('chrome')) {
                return
            }
            // 加入阻塞列表
            var url = new URL(tabs[0].url)
            var domain = convertToDomain(url.hostname)
            addBlockSite(domain)

            // 页面重加载
            chrome.tabs.reload(tabs[0].id)
        }
    })
}, false)

// 解除阻塞
document.getElementById('unblock').addEventListener('click', function() {
    chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
        if (tabs.length > 0) {
            var url = new URL(tabs[0].url)
            // 提取访问路径
            var origin = decodeURIComponent(url.searchParams.get('origin'))
            // 从阻塞列表移除
            var originurl = new URL(origin)
            var domain = convertToDomain(originurl.hostname)
            removeBlockSite(domain)

            // 重定向回原页面
            chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
                if (tabs.length > 0) {
                    chrome.tabs.update(tabs[0].id, {url: origin})
                }
            })
        }
    })
}, false)

// 通配二级域名
function convertToDomain(hostname) {
    var arr = hostname.split('.')
    if (arr.length <= 2) {
        return hostname
    }
    return arr.slice(arr.length - 2).join('.')
}

// 检查阻塞站点
function checkBlockSite(domain) {
    chrome.storage.sync.get(['sites'], function(value) {
        var sites = value['sites']
        if (sites === undefined) {
            sites = []
        }
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] === domain) {
                return true
            }
        }
    })
    return false
}

// 添加阻塞站点
function addBlockSite(domain) {
    chrome.storage.sync.get(['sites'], function(value) {
        var sites = value['sites']
        if (sites === undefined) {
            sites = []
        }
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] === domain) {
                return
            }
        }
        sites.push(domain)
        chrome.storage.sync.set({'sites': sites}, function() {
            console.log('storage sync set success.')
        })
    })
}

// 从站点列表中移除
function removeBlockSite(domain) {
    chrome.storage.sync.get(['sites'], function(value) {
        var sites = value['sites']
        if (sites === undefined) {
            return
        }
        var newsites = []
        for (var i = 0; i < sites.length; i++) {
            if (sites[i] === domain) {
                continue
            }
            newsites.push(sites[i])
        }
        chrome.storage.sync.set({'sites': newsites}, function() {
            console.log('storage sync set success.')
        })
    })
}
