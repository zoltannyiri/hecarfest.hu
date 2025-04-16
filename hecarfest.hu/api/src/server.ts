import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from 'uuid';
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";
import { google } from 'googleapis';
import fs from 'fs';



// Típus definíció a fájlokhoz
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

dotenv.config({
    path: path.join(__dirname, "/.env"),
});

const app: Application = express();
const PORT: number = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer konfiguráció típusosítással
const storage = multer.diskStorage({
    destination: (
        req: Request,
        file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(null, 'uploads/');
    },
    filename: (
        req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Csak képek (jpeg, jpg, png, webp) engedélyezettek!'));
    }
};

const upload = multer({
    storage: multer.memoryStorage(), // <-- Ez a kulcsos változtatás!
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) cb(null, true);
        else cb(new Error('Csak képek (jpeg, jpg, png, webp) engedélyezettek!'));
    }
});

// MongoDB kapcsolat
mongoose.connect(process.env.MONGODB_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions)
    .then(() => {
        console.log("Csatlakozva a MongoDB-hez!");
    })
    .catch((err: Error) => {
        console.error("MongoDB kapcsolati hiba:", err);
    });


//DRIVE CUCC!!!!!!
// const KEYFILEPATH = path.join(__dirname, 'service-account-key.json');
const KEYFILEPATH = 'C:\\hecarfest.hu\\hecarfest.hu\\api\\src\\hecarfest-vip-ef5c3c98bf0f.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Inicializáld a Google Drive API-t
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    // scopes: SCOPES,
    scopes: ['https://www.googleapis.com/auth/drive']
});
auth.getClient()
  .then(() => console.log('Google Drive hitelesítés sikeres'))
  .catch(err => console.error('HIBA a Google hitelesítésnél:', err));




  

const drive = google.drive({ version: 'v3', auth });
// Segédfüggvény a Google Drive-ba feltöltéshez
async function uploadToDrive(file: Express.Multer.File): Promise<string> {
    try {
        console.log('Drive inicializálva?', drive);
console.log('Fájl buffer mérete:', file.buffer?.length);
      console.log('Fájl ellenőrzése:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
  
      const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: ["1VVxhZ0BMwck3V_3kNktawQRt4puASq6X"], // Ellenőrizd a mappa ID-t!
      };
      console.log('Drive auth:', await auth.getClient());
  
      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer), // Közvetlenül a memóriából olvasunk
      };
  
      console.log('Drive API hívás...');
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
  
      console.log('Feltöltés sikeres, fájl ID:', response.data.id);
  
      // Nyilvános hozzáférés
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
  
      return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    } catch (error) {
      console.error('HIBA a Drive feltöltésnél:', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        file: {
          originalname: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype
        }
      });
      throw new Error(`Drive feltöltés sikertelen: ${(error as Error).message}`);
    }
  }





// VIP Regisztrációs séma
const vipRegistrationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    licensePlate: { type: String, required: true },
    carType: { type: String, required: true },
    carImages: [{ type: String }], // Kép elérési utak tömbje
    carImages1: [{ type: String }], // Kép elérési utak tömbje
    carImages2: [{ type: String }], // Kép elérési utak tömbje
    carImages3: [{ type: String }], // Kép elérési utak tömbje
    carImages4: [{ type: String }], // Kép elérési utak tömbje
    carImage: [{ type: String }], // Kép elérési utak tömbje
    carImage1: [{ type: String }], // Kép elérési utak tömbje
    carImage2: [{ type: String }], // Kép elérési utak tömbje
    carImage3: [{ type: String }], // Kép elérési utak tömbje
    carImage4: [{ type: String }], // Kép elérési utak tömbje
    interiorImage: { type: String },
    carStory: { type: String, required: true },
    privacyAccepted: { type: Boolean, required: true },
    registrationDate: { type: Date, default: Date.now }
});

const VIPRegistration = mongoose.model('VIPRegistration', vipRegistrationSchema);

// API végpont a regisztrációhoz
// Módosított VIP regisztrációs végpont
// Módosítsd a VIP regisztrációs végpontot:
// Módosítsd a feltöltési konfigurációt:
app.post('/api/vip-registration',
    upload.fields([
        { name: 'carImage1', maxCount: 1 },
        { name: 'carImage2', maxCount: 1 },
        { name: 'carImage3', maxCount: 1 },
        { name: 'carImage4', maxCount: 1 },
        { name: 'interiorImage', maxCount: 1 }
    ]),
    async (req: Request, res: Response) => {
        try {
            console.log('Bejövő kérés body:', req.body);
            console.log('Bejövő fájlok:', req.files);

            const {
                firstname,
                lastname,
                email,
                phone,
                licenseplate,
                cartype,
                notes,
                privacy
            } = req.body;

            if (!firstname || !lastname || !email || !phone || !licenseplate || !cartype || !notes || !privacy) {
                return res.status(400).json({
                    success: false,
                    message: 'Minden kötelező mezőt ki kell tölteni!'
                });
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            console.log('Fájlok ellenőrzése:', files);

            // Feltöltjük a képeket a Google Drive-ba
            const carImages = [];
            const imageFields = ['carImage1', 'carImage2', 'carImage3', 'carImage4'];
            
            for (const field of imageFields) {
                if (files[field] && files[field][0]) {
                    console.log(`Feltöltés előtt (${field}):`, files[field][0].originalname);
                    try {
                        const fileUrl = await uploadToDrive(files[field][0]);
                        console.log('Sikeres feltöltés, URL:', fileUrl);
                        carImages.push(fileUrl);
                    } catch (uploadError) {
                        console.error('Hiba a feltöltés során:', uploadError);
                        throw uploadError;
                    }
                }
            }

            let interiorImage = '';
            if (files['interiorImage'] && files['interiorImage'][0]) {
                console.log('InteriorImage feltöltése...');
                interiorImage = await uploadToDrive(files['interiorImage'][0]);
            }

            const newRegistration = new VIPRegistration({
                firstName: firstname,
                lastName: lastname,
                email,
                phone,
                licensePlate: licenseplate,
                carType: cartype,
                carImages,
                interiorImage,
                carStory: notes,
                privacyAccepted: privacy === 'on'
            });

            await newRegistration.save();

            res.status(201).json({
                success: true,
                message: 'Sikeres regisztráció! Hamarosan értesítünk e-mailben.'
            });
        } catch (error) {
            console.error('Regisztrációs hiba részletei:', error);
            res.status(500).json({
                success: false,
                message: 'Hiba történt a regisztráció során',
                error: (error as Error).message
            });
        }
    }
);

app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT} porton`);
});