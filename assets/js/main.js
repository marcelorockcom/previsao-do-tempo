(function(){
    class Previsao{
        constructor(){
            this.form = document.querySelector('form')
            this.input = document.querySelector('input[type="text"]')
            this.ulCidades = document.querySelector('.lista-cidades')
            this.infoDiv = document.querySelector('.info')
            this.cidadeDb
            this.eventos()
        }

        eventos(){
            this.form.addEventListener('submit', e =>{
                e.preventDefault()
                const cidade = this.input.value
                if(cidade) this.buscaCidades(String(cidade))
            })
            this.input.addEventListener('keyup', e=>{
                const cidade = this.input.value
                if(cidade && cidade.length >= 3) this.buscaCidades(String(cidade))
                if(cidade.length <= 0) this.limpaBusca()
            })
            document.addEventListener('click', e =>{
                if(e.target.tagName.toLowerCase() === 'li'){
                    const lat = e.target.getAttribute('data-lat');
                    const lon = e.target.getAttribute('data-lon');
                    this.buscaInfoCidade(lat, lon)
                    this.limpaBusca()
                }
            })
        }

        get token(){
            return '7fe243157cee525262ef6a33b4ce7205'
        }

        get localizacao(){
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(local =>{
                    const lat = local.coords.latitude
                    const lon = local.coords.longitude
                    this.buscaInfoCidade(lat, lon)
                })
            }
        }

        async buscaCidades(cidade){
            const query = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade},BR&limit=5&appid=${this.token}&lang=pt_br`
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
            this.infoDiv.querySelector('img').src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`
            this.infoDiv.classList.add('ativo')
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
