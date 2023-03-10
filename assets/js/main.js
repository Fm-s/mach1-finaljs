const ID_PAGINAS = ['despesas','categorias'];


const pageLoad = () => {
    
    const pageArray = ID_PAGINAS.map(el=>document.getElementById(el));
    pageArray[0].classList.add('show');
    for(let page of pageArray){
        for(let node of document.querySelectorAll(`a[href="#${page.id}"]`)){
            node.addEventListener('click',(e)=>{
                e.preventDefault();
                for(let pg of pageArray) pg.classList.remove('show');
                page.classList.add('show');
            })
        }
    }
    
}

window.addEventListener('load',pageLoad)