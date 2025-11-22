import mongoose, { Schema, Document } from 'mongoose';

export interface IExample extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export const ExampleModel = mongoose.model<IExample>('Example', ExampleSchema);
