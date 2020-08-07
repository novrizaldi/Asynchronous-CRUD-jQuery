var express = require('express');
const {
  json
} = require('express');
const {
  off
} = require('../app');
var router = express.Router();

/* GET home page. */
module.exports = function (pool) {

  router.get('/', function (req, res, next) {
    let isSearch = false;
    let searchFinal = ""
    let dataSearch = []

    if (req.query.id) {
      dataSearch.push(`id = ${req.query.id}`)
      isSearch = true
    }
    if (req.query.str) {
      dataSearch.push(`stringd like '%${req.query.str}%'`)
      isSearch = true
    }
    if (req.query.int) {
      dataSearch.push(`integerd = '${req.query.int}'`)
      isSearch = true
    }
    if (req.query.startdate && req.query.enddate) {
      dataSearch.push(`dated BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`)
      isSearch = true
    }
    if (req.query.float) {
      dataSearch.push(`floatd = '${req.query.float}'`)
      isSearch = true
    }
    if (req.query.bool) {
      dataSearch.push(`booleand = '${req.query.bool}'`)
      isSearch = true
    }

    if (isSearch) {
      searchFinal += ` WHERE ${dataSearch.join(' AND ')}`
    }
    console.log(searchFinal);

    const page = Number(req.query.page) || 1
    const limit = 5
    const offset = (page - 1) * limit

    let sql = `SELECT COUNT (id) as total FROM breadd ${searchFinal}`
    pool.query(sql, (err, data) => {
      if (err) {
        return res.json(err)
      } else if (data.rows == 0) {
        return res.send(`Data tidak ditemukan`)
      }
      const total = Number(data.rows[0].total)
      const pages = Math.ceil(total / limit)

      let sql = `select * from breadd ${searchFinal} ORDER BY id limit $1 offset $2` //jquery harus pakai $(dollar)
      pool.query(sql, [limit, offset], (err, data) => {
        if (err) {
          return res.json(err)
        } else if (data.rows == 0) {
          return res.send(`Data tidak ditemukan`)
        } else {
          res.json({
            data: data.rows,
            pages,
            page
          })
        }
      })
    })
  })

  router.post('/', function (req, res, next) {
    pool.query('INSERT INTO breadd (stringd, integerd, floatd, dated, booleand) values ($1, $2, $3, $4, $5)', [req.body.stringd, Number(req.body.integerd), parseFloat(req.body.floatd), req.body.dated, JSON.parse(req.body.booleand)], (err, data) => {
      if (err) return res.json(err)
      res.json(data.rows)
    })
  });

  router.get('/:id', function (req, res, next) {
    pool.query('SELECT * FROM breadd where id=$1', [Number(req.params.id)], (err, data) => {
      if (err) return res.json(err)
      res.json(data.rows)
    })
  });

  router.put('/:id', function (req, res, next) {
    pool.query('UPDATE breadd SET stringd=$2, integerd=$3, floatd=$4, dated=$5, booleand=$6 where id=$1', [Number(req.params.id), req.body.stringd, Number(req.body.integerd), parseFloat(req.body.floatd), req.body.dated, JSON.parse(req.body.booleand)], (err, data) => {
      if (err) return res.json(err)
      res.status(201).json(data.rows)
    })
  });

  router.delete('/:id', function (req, res, next) {
    pool.query('DELETE FROM breadd WHERE id=$1', [Number(req.params.id)], (err, data) => {
      if (err) return res.json(err)
      res.status(201).json(data.rows)
    })
  });

  return router;
}


