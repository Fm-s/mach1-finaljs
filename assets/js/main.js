const ID_PAGINAS = ['despesas','categorias'];

const CATEGORIAS = [];
const DESPESAS = [];

const valueChangeHandler = ({target}) => {
    target.value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(target.value.replace(',','.').replace(/[^\d.]/g, ''));
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
    return true;
}

const newExpense = (nodeArray) => {
    const newExp = {};
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
    return true;
}

const editCategory = (index)=>{
    console.log('edit',index)
};

const deleteCategory = (index)=>{
    console.log('delete',index);
};

const loadCategories = (categorias) => {
    const tbody = document.getElementById('tabela-categorias__corpo')
    tbody.innerHTML = '';
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

            deleteBtn = document.querySelector('.templates div.btn-delete-wrapper').cloneNode(true);
            deleteBtn.addEventListener('click',()=>{
                deleteCategory(index);
            });
            actionDiv.appendChild(deleteBtn)

            tRow.appendChild(actionTd);

            tbody.appendChild(tRow);
        })
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

const modalCategorias = {
    title: "ADICIONAR CATEGORIA",
    nodes: [
        inputGen("categoria","Categoria",{placeholder: "Nome da Categoria"})
    ]
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
        loadModal(modalCategorias,newCategory)
    })
    
    document.querySelector('#despesas .btn-wrapper button')?.addEventListener('click',()=>{
        loadModal(modalDespesas(),newExpense)
    })

    if(DESPESAS.length > 0){

    }else{
        document.getElementById('tabela-contas__corpo')
        .innerHTML = '<tr><td colspan="4">Não há despesas</td></tr>';
    }

    if(CATEGORIAS.length > 0){
        loadCategories([...CATEGORIAS]);
    }else{
        document.getElementById('tabela-categorias__corpo')
        .innerHTML = '<tr><td colspan="3">Não há categorias</td></tr>';
    }
    
}

window.addEventListener('load',pageLoad)