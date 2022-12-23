(function(){
    class Previsao{
        constructor(){
            this.form = document.querySelector('form')
            this.input = document.querySelector('input[type="text"]')
            this.ulCidades = document.querySelector('.lista-cidades')
            this.infoDiv = document.querySelector('.info')
            this.loader = document.querySelector('.loader')
            this.icon = document.querySelector('.icon')
            this.cidadeDb
            this.eventos()
        }

        eventos(){
            this.form.addEventListener('submit', e =>{
                e.preventDefault()
                const cidade = this.input.value
                if(cidade) this.buscaCidades(String(cidade))
            })
            this.input.addEventListener('keydown', e=>{
                const letraAtual = e.key.length === 1 ? e.key : ''
                const cidade = this.input.value + letraAtual
                if(cidade && cidade.length >= 3) this.buscaCidades(String(cidade))
                if(cidade.length <= 0) this.limpaBusca()
            })
            this.ulCidades.addEventListener('click', e =>{
                if(e.target.tagName.toLowerCase() === 'li'){
                    const lat = e.target.getAttribute('data-lat');
                    const lon = e.target.getAttribute('data-lon');
                    this.buscaInfoCidade(lat, lon)
                    this.limpaBusca()
                }else{
                    this.ulCidades.classList.remove('ativo')
                }
            })
            this.input.addEventListener('focusin', e=>{
                if(this.ulCidades.hasChildNodes()){
                    this.ulCidades.classList.add('ativo')
                }
            })
            this.input.addEventListener('blur', e=>{
                setTimeout(() => this.ulCidades.classList.remove('ativo'), 100)
            })
        }

        get token(){
            return '7fe243157cee525262ef6a33b4ce7205'
        }

        get localizacao(){
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(sucesso =>{
                    const lat = sucesso.coords.latitude
                    const lon = sucesso.coords.longitude
                    this.buscaInfoCidade(lat, lon)
                }, erro =>{
                        this.buscaInfoCidade(String(-15.5986686), String(-56.0991301))                    
                })
            }
        }

        async buscaCidades(cidade){
            const query = `https://api.openweathermap.org/geo/1.0/direct?q=${cidade},BR&limit=5&appid=${this.token}&lang=pt_br`
            const resposta = await fetch(query)
            if(resposta.status === 200){
                const json = await resposta.json()
                this.criaCidadesLi(json)
            }     
        }
        
        criaCidadesLi(cidades){
            this.limpaBusca()
            for(let {name, state, lat, lon} of cidades){
                const li = document.createElement('li')
                li.setAttribute('data-lat', lat)
                li.setAttribute('data-lon', lon)
                li.innerHTML = `${name}, ${state}`
                this.ulCidades.appendChild(li)
                this.ulCidades.classList.add('ativo')
            }
        }
        
        async buscaInfoCidade(lat, lon){
            const query = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.token}&units=metric&lang=pt_br`
            try {
                const resposta = await fetch(query)
                if(resposta.ok){
                    const json = await resposta.json()
                    this.loader.classList.remove('d-none')
                    this.mostraInfo(json)
                    this.cidadeDb = {lat: lat, lon: lon}
                }
                if(resposta.status >= 400) throw new Error('Nenhuma cidade encontrada')
            } catch (error) {
                console.log(error)
            }
        }

        mostraInfo(info){
            this.infoDiv.querySelector('.descricao').innerHTML = info.weather[0].description
            this.infoDiv.querySelector('.cidade span').innerHTML = info.name
            this.infoDiv.querySelector('.temperatura').innerHTML = Math.round(info.main.temp)
            const img = new Image()
            img.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`
            this.icon.innerHTML = ''
            this.icon.appendChild(img)
            img.addEventListener('load', ()=>{
                this.infoDiv.classList.add('ativo')
                this.loader.classList.add('d-none')
            })
        }

        set cidadeDb(cidade){
            let json = JSON.stringify(cidade)
            localStorage.setItem('cidade', json)
        }

        get cidadeDb(){
            let cidade = localStorage.getItem('cidade')
            cidade = JSON.parse(cidade)
            if(cidade){
                this.buscaInfoCidade(cidade.lat, cidade.lon)
            }else{
                this.localizacao
            }
        }

        limpaBusca(){
            this.ulCidades.innerHTML = ''
            this.ulCidades.classList.remove('ativo')
        }
    }

    const previsao = new Previsao()  

})()
