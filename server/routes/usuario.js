const express = require('express')
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt');
const _ = require('underscore')


const app = express()

app.get('/usuario', (req, res) => {

    let desde = req.query.desde || 0
    let limite = req.query.limite || 5

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(Number(desde))
        .limit(Number(limite))
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({ estado: true }, (err, count) => {
                res.json({
                    ok: true,
                    usuarios,
                    count
                })
            })
        })
})

app.post('/usuario', (req, res) => {

    let body = req.body
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.put('/usuario/:id', (req, res) => {

    let id = req.params.id
    let body = _.pick(req.body, ['email', 'nombre', 'img', 'role', 'estado'])

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.delete('/usuario/:id', (req, res) => {

    let id = req.params.id

    let cambiaestado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaestado, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

module.exports = app