import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerTaskUploadFileType {
  @Field(() => String, { description: '文件 ID' })
  fileId!: string;

  @Field(() => String, { description: '文件名' })
  name!: string;

  @Field(() => Int, { nullable: true, description: '文件大小（字节）' })
  size!: number | null;

  @Field(() => String, { description: '上传状态' })
  status!: string;

  @Field(() => String, { nullable: true, description: '上传失败信息' })
  errorMessage!: string | null;
}
