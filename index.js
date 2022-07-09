
// Entry Point of the API Server
const fs = require('fs');
const express = require('express');

/* Creates an Express application.
   The express() function is a top-level
   function exported by the express module.
*/
const app = express();
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'jianan',
  host: 'localhost',
  database: 'api',
  password: '',
  dialect: '',
  port: 5432
});


/* To handle the HTTP Methods Body Parser
   is used, Generally used to extract the
   entire body portion of an incoming
   request stream and exposes it on req.body
*/
const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));


pool.connect((err, client, release) => {
  if (err) {
    return console.error(
      'Error acquiring client', err.stack)
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error(
        'Error executing query', err.stack)
    }
    console.log("Connected to Database !")
  })
  const seedQuery = fs.readFileSync('seed.sql', { encoding: 'utf8' });

  pool.query(seedQuery, (err, res) => {
    console.log(err, res)
    console.log('Seeding Completed!')
    pool.end()
  })
})

// ENDPOINT for get all doctors
app.get('/doctors', (req, res, next) => {
  // console.log("TEST DATA :");
  pool.query('Select * from doctors')
    .then(testData => {
      console.log(testData);
      res.send(testData.rows);
    })
})

// ENDPOINT for getting all appointments on a particular day for a particular doctor
app.get('/appointments', (req, res, next) => {
  console.log(req.query);
  const doctorId = req.query.doctorId;
  const appointmentsDay = req.query.date;
  console.log(appointmentsDay);
  pool.query(`Select * from appointments where doctor_id=${doctorId} and date='${appointmentsDay}'`)
  .then(appointments => {
    console.log(appointments);
    res.send(appointments.rows);
  })
})

// Endpoint for delecting an appointment
app.delete('/appointments', (req, res, next) => {
  console.log('this is different $$$$$');
  console.log('req.query: ', req.query.appointmentId);
  const appointmentId = parseInt(req.query.appointmentId);
  console.log('appointmentId: ', appointmentId);
  pool.query(`Delete from appointments where id=${appointmentId}`)
  .then(appointments => {
    console.log(appointments);
    res.send(appointments.rows);
  })
})

// Endpoint for adding an appointment
app.post('/appointments', (req, res, next) => {
  const { patient_first_name, patient_last_name, date, time, kind, doctorId } = req.body;
  const timeInterval = time.split(':')[1];
  const acceptableTimes = [00, 15, 30, 45];
  if (!acceptableTimes.includes(timeInterval)) {
    throw new Error('Appointment times only allowed in 15 min intervals.');
  }

  pool.query(`select * from appointments where doctor_id=${doctorId} and and date='${appointmentsDay}' and time=${time}`).then(appointments => {
    if(appointments.length > 3) {
      throw new Error(`This doctor's appointments for ${date} at ${time} are already full. Please select another time slot.`);
    }
  })

  const sql = `insert into appointments values(${patient_first_name},${patient_last_name},'${date}',${time} ${kind},${doctorId}) `;
  pool.query(sql)
  .then(newAppointment => {
    console.log(newAppointment);
    res.send(newAppointment.rows);
  })
})

// Require the Routes API
// Create a Server and run it on the port 3000
const server = app.listen(3000, function () {
  let host = server.address().address
  let port = server.address().port
  // Starting the Server at the port 3000
})
