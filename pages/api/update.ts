import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_SHEET_ID } from '../../config'

type SheetData = []

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST request are allowed' })
    }

    const body = req.body as SheetData

    try {
        // prepare auth
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_CLIENT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        })

        const sheets = google.sheets({
            auth,
            version: 'v4'
        })

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'A:C',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: body
            }
        })

        return res.status(200).json({
            data: response.data
        })
    } catch (e) {
        console.error(e)
        return res.status(500).send({ message: 'Something went wrong' })
    }
}