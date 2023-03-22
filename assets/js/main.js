const ID_PAGINAS = ['despesas','categorias'];


let CATEGORIAS;
let DESPESAS;

function uniqueId(tag){
    let ID;
    if(window.localStorage.getItem('uniqueId')){
        ID = JSON.parse(window.localStorage.getItem('uniqueId'));
    }else{
        ID = {}
    };
    
    if(ID[tag]){
        ID[tag].last = ID[tag].next;
        ID[tag].next = ID[tag].next + 1;
    }else{
        ID[tag] = {};
        ID[tag].last = 1;
        ID[tag].next = 2;
    }
    window.localStorage.setItem('uniqueId',JSON.stringify(ID));
    return ID[tag].last;
}

const persitCategory = (categories) => {
    window.localStorage.setItem('categorias',JSON.stringify(categories));
}

const loadCategory = () => {
    if(window.localStorage.getItem('categorias')){
        const cat = JSON.parse(window.localStorage.getItem('categorias'));
        if(cat.length > 0){
            return cat;
        }else{
            return [
                {
                    name: 'Geral',
                    id: 0
                }
            ];
        }
    }else{
        return [
            {
                name: 'Geral',
                id: 0
            }
        ];
    }
}

const persistExpense = (expenses) => {
    window.localStorage.setItem('despesas',JSON.stringify(expenses));
}

const loadExpenses = () => {
    if(window.localStorage.getItem('despesas')){
        return JSON.parse(window.localStorage.getItem('despesas'));
    }else{
        return []
    }
}

const stringToNumber = (value) => {
     return value.replace('.','').replace(',','.').replace(/[^\d.]/g, '');
}

const numberFormatBR = (value) => {
    if(typeof(value) === 'string'){
        value = stringToNumber(value);
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
}

const updateTotals = () => {
    
    const totalPago = document.querySelector('.totals-box.pago p');
    const totalAPagar = document.querySelector('.totals-box.apagar p');
    const totalAtrasadas = document.querySelector('.totals-box.atrasadas p');
    
    totalPago.innerText = numberFormatBR(DESPESAS.filter(el=>el.pago)
        .reduce((total,el)=>total += +stringToNumber(el.valor),0));
            
    totalAPagar.innerText = numberFormatBR(DESPESAS.filter(el=>!el.pago)
        .reduce((total,el)=>total += +stringToNumber(el.valor),0));

    totalAtrasadas.innerText = DESPESAS.filter(el=>{
        const splitDate = el.date.split('/');
        const today = new Date();
        return !el.pago && (today.getFullYear() > +splitDate[2] || 
            (today.getFullYear() === +splitDate[2] && today.getMonth()+1 > +splitDate[1] ||
             (today.getFullYear() === +splitDate[2] && today.getMonth()+1 === +splitDate[1] && today.getDate() > +splitDate[0])));
    }).length;
}

const valueChangeHandler = ({target}) => {
    target.value = numberFormatBR(target.value);
}
//chatGPT
const dateKeyDownHandler = (event) => {
    let dateInput = event.target;

    if (
        event.key.length === 1 &&
        !/^\d$|\/$/.test(event.key) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key !== 'Backspace' &&
        event.key !== 'Delete' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Tab'
    ) {
        event.preventDefault();
    } else {
        let dateString = dateInput.value.replace(/^(\d{2})(\d)/, '$1/$2');
        dateString = dateString.replace(/^(\d{2})\/(\d{2})(\d+)/, '$1/$2/$3');
        dateInput.value = dateString;
    }
}
//chatGPT
const isValidDate = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = regex.exec(dateString);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Months are 0-based
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
};

const validateDate = (dateStr) => {    
    return dateStr.length === 10 && isValidDate(dateStr);
}

const popAlert = (text,successes) => {
    const pAlert = document.querySelector('.templates div.alert-box').cloneNode(true);
    pAlert.querySelector('.text').innerText = text;
    pAlert.querySelector('.alert-box__card').classList.add(successes ? 'successes' : 'error');
    pAlert.querySelector('button').addEventListener('click',()=>{
        pAlert.remove();
    })
    document.body.appendChild(pAlert);
}

const popConfirm = (text,action,title = '') => {
    const cAltert = document.querySelector('.templates div.confirm-box').cloneNode(true);
    cAltert.querySelector('.confirm-box__card__header__title').innerText = title;
    cAltert.querySelector('.confirm-box__content').innerText = text;
    cAltert.querySelector('button.confirm-box__control__btn.yes').addEventListener('click',()=>{
        action();
        cAltert.remove();
    });

    cAltert.querySelector('button.confirm-box__control__btn.no').addEventListener('click',()=>{
        cAltert.remove();
    });
    document.body.appendChild(cAltert);
}

const loadModal = (modalData,action)=>{
    const modal = document.querySelector('.templates div.template-modal').cloneNode(true);
    modal.querySelector(".title-wrapper h4").innerHTML = modalData.title;
    
    modal.querySelector('.btn-modal-save button')?.addEventListener('click',()=>{
        if ( action(modal.querySelectorAll('.content input')) ) modal.remove();
    })

    modal.querySelector('.btn-modal-cancel button')?.addEventListener('click',()=>{
        modal.remove();
    })

    const contentDiv = modal.querySelector('.content');
    if(contentDiv) for( aNode of modalData.nodes) contentDiv.appendChild(aNode);
    
    document.body.appendChild(modal);
}

const filterList = (searchId, sourceArray, action) => {
    const words = document.querySelector(`#${searchId} .caixa-filtro input`).value.split(' ').map(el=>el.toLowerCase().trim()).filter(el=>el!=='');
    if(words.length === 0) return false;
    let filterFn;
    if(searchId === 'despesas'){
        filterFn = (el) => {
            let match = 0;
            for(let key in el){
                if(key !== "id"){
                    for(let word of words){
                        console.log('in',el[key].toString().toLowerCase(),word);
                        if(el[key].toString().toLowerCase().includes(word)){
                            match++
                        }
                    }
                }
            }
            console.log(match, words.length);
            return match >= words.length;
        }
    };
    if(searchId === 'categorias'){
        filterFn = (el) => {
            let match = 0;
            for(let word of words){
                if(el.name.toLowerCase().includes(word)){
                    match++;
                }
            }
            return match == words.length;
        }
    };
    action(sourceArray.filter(filterFn));
    return true;
}

const dataListGen = (id,source) => {
    datalist = document.createElement('datalist')
    datalist.id = id
    for(let el of source){
        const option = document.createElement('option');
        option.value = el.name;
        datalist.appendChild(option);
    }
    return datalist;
}

const inputGen = (label,name,extras) => {
    const txtInput = document.querySelector('.templates div.form-template').cloneNode(true);
    const inputEl = txtInput.querySelector('input');
    txtInput.querySelector('label').innerText = label;
    inputEl.name = name;
    if(extras.placeholder) inputEl.placeholder = extras.placeholder
    if(extras.value) inputEl.value = extras.value;
    if(extras.changeEv) inputEl.addEventListener('change',extras.changeEv);
    if(extras.keydownEv) inputEl.addEventListener('keydown',extras.keydownEv);
    if(extras.list && extras.dataList){
        inputEl.setAttribute('list',extras.list);
        txtInput.appendChild(extras.dataList);
    }
    if(extras.maxLength) inputEl.setAttribute('maxlength',extras.maxLength);
    
    return txtInput;
}

const newCategory = (nodeArray) => {
    const categoryName = nodeArray[0].value;
            if(CATEGORIAS.map(el=>el.name.toLowerCase()).includes(categoryName.toLowerCase())){
                popAlert(`Categoria com nome: ${categoryName} já cadastrada`);
                return false;
            }else{
                CATEGORIAS.push({name: categoryName, id: uniqueId('cat')});
                clearFilterField(ID_PAGINAS[1]);
                persitCategory(CATEGORIAS);
                loadCategories([...CATEGORIAS]);
                popAlert('Cadastrada com sucesso!',true);
                return true;
            };
}

const newExpense = (nodeArray) => {
    const newExp = {id: uniqueId('exp'),pago: false};
    for(let aNode of nodeArray){
        switch(aNode.name){
            case 'categoria':
                if(CATEGORIAS.map(el=>el.name).includes(aNode.value)){
                    newExp.categoria = aNode.value
                } else {
                    popAlert("Categoria não cadastrada!");
                    return false;
                }
                break;
            case 'dta-vencimento':
                if(validateDate(aNode.value)) newExp.date = aNode.value;
                else {
                    popAlert("Data Inválida!");
                    return false;
                }
                break;
            case 'despesa':
                if(aNode.value) newExp.descricao = aNode.value;
                else {
                    popAlert("Descrição não pode estar em branco!");
                    return false;
                }
                break;
            case 'valor':
                if(aNode.value.replace(/\D/g, '') > 0) newExp.valor = aNode.value;
                else {
                    popAlert("Valor não pode estar em zerado!");
                    return false;
                }
                break;
        }
    }    
    clearFilterField(ID_PAGINAS[0]);
    DESPESAS.push(newExp);
    persistExpense(DESPESAS);
    loadDespesas([...DESPESAS]);
    updateTotals();
    return true;
}

const deleteDespesa = (idDespesa) => {
    popConfirm("Deseja apagar despesa? (essa ação não é reversivel!",()=>{
        let counter = 0;
        for(let despesa of DESPESAS){
            if(despesa.id === idDespesa){
                DESPESAS.splice(counter,1);
                break;     
            }
            counter++;
        }
        clearFilterField(ID_PAGINAS[0]);
        persistExpense(DESPESAS);
        loadDespesas([...DESPESAS]);
        updateTotals();
    },'Excluir');
}

const expenseStatus = (parent, button, control) => {
    parent.removeChild(button);
    control.pago = !control.pago;
    persistExpense(DESPESAS);
    button = document.querySelector(`.templates ${control.pago ? 'div.btn-pago-wrapper' : 'div.btn-pendente-wrapper'}`).cloneNode(true);
    button.querySelector('button').addEventListener('click',()=>{
        expenseStatus(parent, button, control)
    })
    parent.appendChild(button);
    updateTotals();
}

const loadDespesas = (despesas) => {
    const tbody = document.getElementById('tabela-contas__corpo');
    if(despesas.length > 0){
        tbody.innerHTML = '';
        despesas.forEach((el,index)=>{
            const tRow = document.createElement('tr');
            
            const dataTd = document.createElement('td');
            dataTd.innerText = el.date;
            tRow.appendChild(dataTd);
            
            const catTd = document.createElement('td');
            catTd.innerText = el.categoria;
            tRow.appendChild(catTd);

            const descTd = document.createElement('td');
            descTd.innerText = el.descricao;
            tRow.appendChild(descTd);

            const valorTd = document.createElement('td');
            valorTd.innerText = el.valor;
            tRow.appendChild(valorTd);

            const statusTd = document.createElement('td');
            const divStatusCtrl = document.createElement('div');
            statusTd.appendChild(divStatusCtrl);
            tRow.appendChild(statusTd);

            const paymentStatus = document.createElement('div');
            let actionButton = document.querySelector(`.templates ${el.pago ? 'div.btn-pago-wrapper' : 'div.btn-pendente-wrapper'}`).cloneNode(true);
            actionButton.querySelector('button').addEventListener('click',()=>{
                expenseStatus (paymentStatus, actionButton, el);
            })
            paymentStatus.appendChild(actionButton);
            divStatusCtrl.appendChild(paymentStatus);
    
            let excludeButton = document.querySelector('.templates div.btn-delete-wrapper').cloneNode(true);
            excludeButton.querySelector('button').addEventListener('click',()=>{
                deleteDespesa(el.id);
            })
            divStatusCtrl.appendChild(excludeButton);
            
            tbody.appendChild(tRow);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5">Não há despesas</td></tr>';  
    }
}

const editCategory = (catId)=>{
    loadModal(
        {
            title: 'Editar Categoria',
            nodes: [
                inputGen("categoria","Categoria",
                {
                    placeholder: "Nome da Categoria",
                    value: CATEGORIAS.filter(el=>el.id === catId)[0].name
                })
            ]
        },
        (nodeArray)=>{
            const categoryName = nodeArray[0].value;
            if(CATEGORIAS.map(el=>el.name.toLowerCase()).includes(categoryName.toLowerCase())){
                popAlert(`Categoria com nome: ${categoryName} já cadastrada`);
                return false;
            }else{
                let changed = 0;
                DESPESAS.forEach(el=>{
                    if(el=>el.categoria === CATEGORIAS.filter(el=>el.id === catId)[0].name){
                        changed++;
                        el.categoria = categoryName
                    }
                })
                let counter = 0;
                for(let categoria of CATEGORIAS){
                    if(categoria.id === catId){
                        CATEGORIAS[counter].name = categoryName;
                        break;
                    }
                    counter++;
                }
                clearFilterField(ID_PAGINAS[1]);
                loadCategories([...CATEGORIAS]);
                if(changed > 0){
                    clearFilterField(ID_PAGINAS[0]);
                    persistExpense(DESPESAS)
                    loadDespesas([...DESPESAS]);
                }
                popAlert('Categoria editada com sucesso!',true);
                return true;
            };
        })
};

const deleteCategory = (catId)=>{
    if(catId === 0){
        popAlert("Não é possivel deletar a categoria principal!")
    }else{
        let changed = 0;
        popConfirm("Confirma apagar Categoria? (essa ação não é reversivel!)",()=>{
            DESPESAS.forEach(el=>{
                if(el=>el.categoria === CATEGORIAS.filter(el=>el.id === catId)[0].name){
                    changed++;
                    el.categoria = CATEGORIAS.filter(el=>el.id === 0)[0].name;
                }
            })
            
            let counter = 0;
            for(let categoria of CATEGORIAS){
                if(categoria.id === catId){
                    CATEGORIAS.splice(counter,1);
                    persitCategory(CATEGORIAS);
                    break;
                }
                counter++;
            }
            clearFilterField(ID_PAGINAS[1]);
            loadCategories([...CATEGORIAS]);
            if(changed > 0){
                clearFilterField(ID_PAGINAS[0]);
                persistExpense(DESPESAS)
                loadDespesas([...DESPESAS]);
            }
        },'Exclusão');
    }
};

const loadCategories = (categorias) => {

    const tbody = document.getElementById('tabela-categorias__corpo')
    tbody.innerHTML = '';

    if(categorias.length > 0){
    categorias.forEach((el)=>{
            const tRow = document.createElement('tr');
            
            const idTd = document.createElement('td');
            idTd.innerText = el.id;
            tRow.appendChild(idTd);

            const catNameTd = document.createElement('td');
            catNameTd.innerText = el.name;
            tRow.appendChild(catNameTd);

            
            const actionTd = document.createElement('td');
            
            const actionDiv = document.createElement('div');
            actionTd.appendChild(actionDiv);

            editBtn = document.querySelector('.templates div.btn-edit-wrapper').cloneNode(true);
            editBtn.addEventListener('click',()=>{
                editCategory(el.id);
            });
            actionDiv.appendChild(editBtn);

            if(el.id !== 0){
                deleteBtn = document.querySelector('.templates div.btn-delete-wrapper').cloneNode(true);
                deleteBtn.addEventListener('click',()=>{
                    deleteCategory(el.id);
                });
                actionDiv.appendChild(deleteBtn)
            }

            tRow.appendChild(actionTd);

            tbody.appendChild(tRow);
        })
    }else{
        tbody.innerHTML = '<tr><td colspan="3">Não há categorias</td></tr>';
    }
}

const clearFilterField = (containerId) => {
        document.querySelector(`#${containerId} .caixa-filtro .limparFiltroWrapper`).classList.remove('show');
        document.querySelector(`#${containerId} .caixa-filtro input`).value = "";
}

const filterActionAttach = (containerId,sourceArray,action) => {
    document.querySelector(`#${containerId} .caixa-filtro > button`).addEventListener('click',()=>{
        if(filterList(containerId,sourceArray,action)){
            document.querySelector(`#${containerId} .caixa-filtro .limparFiltroWrapper`).classList.add('show');
        }else{
            popAlert("Digite um valor para filtrar!");
        };
    });
    document.querySelector(`#${containerId} .caixa-filtro .limparFiltroWrapper button`).addEventListener('click',()=>{
        action([...sourceArray]);
        clearFilterField(containerId);
    });
}

const modalDespesas = () => {
    return {title: "ADICIONAR DESPESA",
    nodes: [
        inputGen("Categoria","categoria",{placeholder: "Busque a categoria", list: "cat-input", dataList: dataListGen('cat-input',[...CATEGORIAS])}),
        inputGen("Data de Vencimento","dta-vencimento",{
            placeholder: "Insira o vencimento: (dd/mm/yyyy)",
            keydownEv: dateKeyDownHandler,
            maxLength: 10
        }),
        inputGen("Despesa","despesa",{placeholder: "Descrição da despesa"}),
        inputGen("Valor","valor",{placeholder: "Valor da despesa", changeEv: valueChangeHandler}),
    ]
    }
}

const modalCategorias = () => {
    return {
        title: "ADICIONAR CATEGORIA",
        nodes: [
            inputGen("categoria","Categoria",{placeholder: "Nome da Categoria"})
        ]
    }
}

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

    document.querySelector('#categorias .btn-wrapper button').addEventListener('click',()=>{
        loadModal(modalCategorias(),newCategory)
    })
    
    document.querySelector('#despesas .btn-wrapper button')?.addEventListener('click',()=>{
        loadModal(modalDespesas(),newExpense)
    })

    DESPESAS = loadExpenses()
    loadDespesas([...DESPESAS]);

    CATEGORIAS = loadCategory();
    loadCategories([...CATEGORIAS]);

    filterActionAttach(ID_PAGINAS[0],DESPESAS,loadDespesas);
    filterActionAttach(ID_PAGINAS[1],CATEGORIAS,loadCategories);

    updateTotals();
}

window.addEventListener('load',pageLoad)