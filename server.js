const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

let calculations = [];

app.post('/calculate', (req, res) => {
    const {rate, devices} = req.body;

    if (rate == null || !Array.isArray(devices)) {
        return res.status(400).json({
            error: 'Rate and devices are required'
        });
    }

    let totalUsage = 0;
    let totalCost = 0;
    let totalPower = 0;

    const results = devices.map(device => {
        const power = Number(device.power);
        const hours = Number(device.hours);

        
        const energy = (power * hours) / 1000;// Energy in kWh

        
        const cost = energy * (rate / 100); // Cost in SGD

        totalUsage += energy;
        totalCost += cost;
        totalPower += power;

        return {
            name: device.name,
            power,
            hours,
            energy: Number(energy.toFixed(2)),
            cost: Number(cost.toFixed(2))
        };
    });

    const calculation = {
        id: Date.now(),
        rate,
        devices: results,
        summary: {
            totalUsage: Number(totalUsage.toFixed(2)),
            totalCost: Number(totalCost.toFixed(2)),
            totalPower: Number((totalPower / 1000).toFixed(2)) // kW
        }
    };
    calculations.push(calculation);
    res.status(200).json(calculation);
});

// Get all calculations
app.get('/calculations', (req, res) => {
    res.json(calculations);
});

// Get one calculation
app.get('/calculations/:id', (req, res) => {
    const id = Number(req.params.id);

    const calculation = calculations.find(c => c.id === id);

    if (!calculation) {
        return res.status(404).json({
            error: 'Calculation not found'
        });
    }

    res.json(calculation);
});

// Delete calculation
app.delete('/calculations/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = calculations.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Calculation not found'
        });
    }

    calculations.splice(index, 1);

    res.json({
        message: 'Calculation deleted'
    });
});

app.put('/calculations', (req, res) => {
  const { id, updates } = req.body;
  const index = calculations.findIndex(calc => calc.id === id);
  if (index === -1) return res.status(404).json({ error: 'Calculation not found' });
  calculations[index] = { ...calculations[index], ...updates };
  res.json(calculations[index]);
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


