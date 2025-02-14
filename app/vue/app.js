import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItemStandard.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/RatingIndicator.js";


/* global Vue axios */ //> from vue.html
const $ = sel => document.querySelector(sel)
const GET = (url) => axios.get('/browse'+url)
const POST = (cmd,data) => axios.post('/browse'+cmd,data)

const books = Vue.createApp ({

    data() {
      return {
        list: [],
        book: undefined,
        order: { quantity:1, succeeded:'', failed:'' },
        user: undefined
      }
    },

    methods: {

        search: ({target:{value:v}}) => books.fetch(v && '&$search='+v),

        async fetch (etc='') {
            const {data} = await GET(`/Books`)
            books.list = data.value;
        },

        async inspect (_book) {
            debugger;
            const book = books.book = _book;
            const res = await GET(`/Books/${book.ID}?$select=descr,stock`)
            Object.assign (book, res.data)
            books.order = { quantity:1 }
            setTimeout (()=> $('form > input').focus(), 111)
        },

        async submitOrder () {
            const {book,order} = books, quantity = parseInt (order.quantity) || 1 // REVISIT: Okra should be less strict
            try {
                const res = await POST(`/submitOrder`, { quantity, book: book.ID })
                book.stock = res.data.stock
                books.order = { quantity, succeeded: `Successfully ordered ${quantity} item(s).` }
            } catch (e) {
                books.order = { quantity, failed: e.response.data.error ? e.response.data.error.message : e.response.data }
            }
        },

        async login() {
            try {
                const { data:user } = await axios.post('/user/login',{})
                if (user.id !== 'anonymous') books.user = user
            } catch (err) { books.user = { id: err.message } }
        },

        async getUserInfo() {
            try {
                const { data:user } = await axios.get('/user/me')
                if (user.id !== 'anonymous') books.user = user
            } catch (err) { books.user = { id: err.message } }
        },
    }
}).mount('#app')

books.getUserInfo()
books.fetch() // initially fill list of books

document.addEventListener('keydown', (event) => {
    // hide user info on request
    if (event.key === 'u')  books.user = undefined
})

axios.interceptors.request.use(csrfToken)
function csrfToken (request) {
    if (request.method === 'head' || request.method === 'get') return request
    if ('csrfToken' in document) {
        request.headers['x-csrf-token'] = document.csrfToken
        return request
    }
    return fetchToken().then(token => {
        document.csrfToken = token
        request.headers['x-csrf-token'] = document.csrfToken
        return request
    }).catch(() => {
        document.csrfToken = null // set mark to not try again
        return request
    })

    function fetchToken() {
        return axios.get('/', { headers: { 'x-csrf-token': 'fetch' } })
        .then(res => res.headers['x-csrf-token'])
    }
}