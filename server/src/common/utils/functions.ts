import * as bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { ListAudioType, ListImageType } from '../types/utils.types';
import { CookieOptions, Response } from 'express';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

export function hashString(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export async function comparePassword(
  passwrod: string,
  confirmPassword: string,
): Promise<boolean> {
  const comparePassword = await bcrypt.compare(passwrod, confirmPassword);
  return comparePassword;
}

export function getImageUrl(files: any) {
  return files[0].path.replace(/\\/g, '/').replace('public/', '');
}

export function createUploadPath(id: string, sec: any): string {
  const uploadPath = path.join('public', 'uploads', sec, id);
  fs.mkdirSync(uploadPath, { recursive: true });
  return path.join('public', 'uploads', sec, id);
}

export function listOfImages(files: any[]) {
  if (files?.length > 0) {
    return files.map((file) => ({
      title: file.filename,
      url: file.path.replace(/\\/g, '/').replace('public/', ''),
    }));
  } else {
    return [];
  }
}

export function listOfAudios(files: any[], fileDetails: any) {
  if (files?.length > 0) {
    const mamad = files.map((file, index: number) => ({
      title: file?.filename,
      audioCreator: fileDetails[index]?.audioCreator,
      audioType: fileDetails[index]?.audioType,
      audioDesc: fileDetails[index]?.audioDesc,
      url: file?.path?.replace(/\\/g, '/').replace('public/', ''),
    }));

    return mamad;
  } else {
    return [];
  }
}

export async function setAccessTokenCookie(res: Response, accessToken: string) {
  // const cookieOptions: any = {
  const cookieOptions: CookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 1,
    httpOnly: true,
    secure: true,
    // sameSite: 'none',
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    // secure: process.env.NODE_ENV === 'development' ? false : true,
    domain:
      process.env.NODE_ENV === 'development' ? 'localhost' : '.nodbe.info',
  };

  await res.cookie('accessToken', accessToken, cookieOptions);
}

export async function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
) {
  const cookieOptions: CookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 2,
    httpOnly: true,
    // sameSite: 'none',
    secure: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    // secure: process.env.NODE_ENV === 'development' ? false : true,
    domain:
      process.env.NODE_ENV === 'development' ? 'localhost' : '.nodbe.info',
  };
  await res.cookie('refreshToken', refreshToken, cookieOptions);
}

export function checkYourself(req: any, id: string, message: string) {
  if (req.user.userId == id) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}
