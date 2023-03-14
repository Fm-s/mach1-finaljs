const ID_PAGINAS = ['despesas','categorias'];

const CATEGORIAS = ['Geral'];
const DESPESAS = [];

const stringToNumber = (value) => {
     return value.replace(',','.').replace(/[^\d.]/g, '');
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
             (today.getFullYear() === +splitDate[2] && today.getMonth()+1 === +splitDate[1] && today.getDay() > splitDate[0])));
    }).length;
}

const valueChangeHandler = ({target}) => {
    target.value = numberFormatBR(target.value);
}

//Chat GPT
const dateKeyDownHandler = (event) => {
    let input = event.target;
    let key = event.key;
  
    // Only format the input if the key pressed is a number, slash, or backspace
    if (/\d|\//.test(key) || key === 'Backspace' || key == 'Delete') {
      // Remove any non-numeric characters from the input
      let cleanedInput = input.value.replace(/\D/g, '');
  
      // Format the input as "DD/MM/YYYY"
      if (cleanedInput.length >= 2) {
        cleanedInput = `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2)}`;
      }
      if (cleanedInput.length >= 5) {
        cleanedInput = `${cleanedInput.slice(0, 5)}/${cleanedInput.slice(5)}`;
      }
  
      // Set the value of the input to the formatted date
      input.value = cleanedInput;
    } else {
      // Prevent any other keys from being typed in the input
      event.preventDefault();
    }
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
                for(let word of words){
                    if(el[key].toString().toLowerCase().includes(word)){
                        match++
                    }
                }
            }
            return match === words.length;
        }
    };
    if(searchId === 'categorias'){
        filterFn = (el) => {
            let match = 0;
            for(let word of words){
                if(word === el.toLowerCase()){
                    match++;
                }
            }
            return match === words.length;
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
        option.value = el;
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
            if(CATEGORIAS.map(el=>el.toLowerCase()).includes(categoryName.toLowerCase())){
                popAlert(`Categoria com nome: ${categoryName} já cadastrada`);
                return false;
            }else{
                CATEGORIAS.push(categoryName);
                loadCategories([...CATEGORIAS]);
                popAlert('Cadastrada com sucesso!',true);
                return true;
            };
}

const validateDate = (dateStr) => {
    return dateStr.length === 10;
}

const newExpense = (nodeArray) => {
    const newExp = {pago: false};
    for(let aNode of nodeArray){
        switch(aNode.name){
            case 'categoria':
                if(CATEGORIAS.includes(aNode.value)){
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
    DESPESAS.push(newExp);
    loadDespesas([...DESPESAS]);
    updateTotals();
    return true;
}

const expenseStatus = (parent, button, control) => {
    parent.removeChild(button);
    control.pago = !control.pago;
    button = document.querySelector(`.templates ${control.pago ? 'div.btn-pago-wrapper' : 'div.btn-pendente-wrapper'}`).cloneNode(true);
    button.addEventListener('click',()=>{
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
            let actionButton = document.querySelector(`.templates ${el.pago ? 'div.btn-pago-wrapper' : 'div.btn-pendente-wrapper'}`).cloneNode(true);
            actionButton.addEventListener('click',()=>{
                expenseStatus (statusTd, actionButton, el);
            })
            statusTd.appendChild(actionButton);
            tRow.appendChild(statusTd);

            tbody.appendChild(tRow);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5">Não há despesas</td></tr>';  
    }
}

const editCategory = (index)=>{
    loadModal(
        {
            title: 'Editar Categoria',
            nodes: [
                inputGen("categoria","Categoria",
                {
                    placeholder: "Nome da Categoria",
                    value: CATEGORIAS[index]
                })
            ]
        },
        (nodeArray)=>{
            const categoryName = nodeArray[0].value;
            if(CATEGORIAS.map(el=>el.toLowerCase()).includes(categoryName.toLowerCase())){
                popAlert(`Categoria com nome: ${categoryName} já cadastrada`);
                return false;
            }else{
                let changed = 0;
                DESPESAS.forEach(el=>{
                    if(el=>el.categoria === CATEGORIAS[index]){
                        changed++;
                        el.categoria = categoryName
                    }
                })
                CATEGORIAS[index] = categoryName;
                loadCategories([...CATEGORIAS]);
                if(changed > 0) loadDespesas([...DESPESAS]);
                popAlert('Categoria editada com sucesso!',true);
                return true;
            };
        })
};

const deleteCategory = (index)=>{
    if(index === 0){
        popAlert("Não é possivel deletar a categoria principal!")
    }else{
        let changed = 0;
        popConfirm("Confirma apagar Categoria? (essa ação não é reversivel!)",()=>{
            DESPESAS.forEach(el=>{
                if(el=>el.categoria === CATEGORIAS[index]){
                    changed++;
                    el.categoria = CATEGORIAS[0];
                }
            })
            CATEGORIAS.splice(index,1);
            loadCategories([...CATEGORIAS]);
            if(changed > 0) loadDespesas([...DESPESAS]);
        },'Exclusão');
    }
};

const loadCategories = (categorias) => {

    const tbody = document.getElementById('tabela-categorias__corpo')
    tbody.innerHTML = '';

    if(categorias.length > 0){
    categorias.forEach((el,index)=>{
            const tRow = document.createElement('tr');
            
            const idTd = document.createElement('td');
            idTd.innerText = index + 1;
            tRow.appendChild(idTd);

            const catNameTd = document.createElement('td');
            catNameTd.innerText = el;
            tRow.appendChild(catNameTd);

            
            const actionTd = document.createElement('td');
            
            const actionDiv = document.createElement('div');
            actionTd.appendChild(actionDiv);

            editBtn = document.querySelector('.templates div.btn-edit-wrapper').cloneNode(true);
            editBtn.addEventListener('click',()=>{
                editCategory(index);
            });
            actionDiv.appendChild(editBtn);

            if(index !== 0){
                deleteBtn = document.querySelector('.templates div.btn-delete-wrapper').cloneNode(true);
                deleteBtn.addEventListener('click',()=>{
                    deleteCategory(index);
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
        document.querySelector(`#${containerId} .caixa-filtro .limparFiltroWrapper`).classList.remove('show');
        document.querySelector(`#${containerId} .caixa-filtro input`).value = "";
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

    loadDespesas([...DESPESAS]);

    loadCategories([...CATEGORIAS]);

    filterActionAttach(ID_PAGINAS[0],DESPESAS,loadDespesas);
    filterActionAttach(ID_PAGINAS[1],CATEGORIAS,loadCategories);

    updateTotals();
}

window.addEventListener('load',pageLoad)