const mongoose = require('mongoose');

// Each role assignment within a service
const assignmentSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true }, // e.g. "Projections", "Sound", "Cam1"
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    memberName: { type: String, trim: true, default: '' }, // denormalised for fast rendering
}, { _id: true });

// Each service block within a Sunday
const serviceSchema = new mongoose.Schema({
    time: { type: String, enum: ['0700', '0900', '1100', '1800'], required: true },
    assignments: { type: [assignmentSchema], default: [] },
}, { _id: false });

const rotaSchema = new mongoose.Schema({
    sundayDate: { type: Date, required: true },
    services: { type: [serviceSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    closingMessage: {
        type: String,
        default: "Let's all Prepare well.\nThank you.",
    },
}, {
    timestamps: true,
});

// One rota per Sunday
rotaSchema.index({ sundayDate: 1 }, { unique: true });

module.exports = mongoose.model('Rota', rotaSchema);
