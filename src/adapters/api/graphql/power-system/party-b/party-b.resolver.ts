import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { Public } from '@adapters/api/graphql/decorators/public.decorator';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePartyBUsecase } from '@usecases/power-system/party-b/create-party-b.usecase';
import { DeletePartyBUsecase } from '@usecases/power-system/party-b/delete-party-b.usecase';
import { GetPartyBUsecase } from '@usecases/power-system/party-b/get-party-b.usecase';
import {
  ListPartyBsUsecase,
  type ListPartyBsUsecaseResult,
} from '@usecases/power-system/party-b/list-party-bs.usecase';
import { UpdatePartyBUsecase } from '@usecases/power-system/party-b/update-party-b.usecase';
import { CreatePartyBInput } from './dto/create-party-b.input';
import { DeletePartyBInput } from './dto/delete-party-b.input';
import { PartyBInput } from './dto/party-b.input';
import { PartyBsInput } from './dto/party-bs.input';
import { PartyBsOutput } from './dto/party-bs.output';
import { PartyBType } from './dto/party-b.type';
import { UpdatePartyBInput } from './dto/update-party-b.input';

@Resolver(() => PartyBType)
export class PowerSystemPartyBResolver {
  constructor(
    private readonly listPartyBsUsecase: ListPartyBsUsecase,
    private readonly getPartyBUsecase: GetPartyBUsecase,
    private readonly createPartyBUsecase: CreatePartyBUsecase,
    private readonly updatePartyBUsecase: UpdatePartyBUsecase,
    private readonly deletePartyBUsecase: DeletePartyBUsecase,
  ) {}

  @Public()
  @ValidateInput()
  @Query(() => PartyBsOutput, { description: '查询乙方主体列表' })
  async partyBs(@Args('input', { nullable: true }) input?: PartyBsInput): Promise<PartyBsOutput> {
    const result = await this.listPartyBsUsecase.execute({
      configName: input?.configName,
      companyName: input?.companyName,
      isDefault: input?.isDefault,
    });

    return {
      items: result.items.map((item) => this.toPartyBType(item)),
      total: result.total,
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => PartyBType, { description: '查询单个乙方主体' })
  async partyB(@Args('input') input: PartyBInput): Promise<PartyBType> {
    const result = await this.getPartyBUsecase.execute({
      partyBId: input.partyBId,
    });

    return this.toPartyBType(result);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => PartyBType, { description: '创建乙方主体' })
  async createPartyB(@Args('input') input: CreatePartyBInput): Promise<PartyBType> {
    const result = await this.createPartyBUsecase.execute({
      configName: input.configName,
      companyName: input.companyName,
      creditCode: input.creditCode,
      companyAddress: input.companyAddress,
      legalPerson: input.legalPerson,
      contactPerson: input.contactPerson,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      depositoryBank: input.depositoryBank,
      bankAccountNo: input.bankAccountNo,
      hotLine: input.hotLine,
      isDefault: input.isDefault,
    });

    return this.toPartyBType(result.partyB);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => PartyBType, { description: '更新乙方主体' })
  async updatePartyB(@Args('input') input: UpdatePartyBInput): Promise<PartyBType> {
    const result = await this.updatePartyBUsecase.execute({
      partyBId: input.partyBId,
      configName: input.configName,
      companyName: input.companyName,
      creditCode: input.creditCode,
      companyAddress: input.companyAddress,
      legalPerson: input.legalPerson,
      contactPerson: input.contactPerson,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      depositoryBank: input.depositoryBank,
      bankAccountNo: input.bankAccountNo,
      hotLine: input.hotLine,
      isDefault: input.isDefault,
    });

    return this.toPartyBType(result.partyB);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => Boolean, { description: '删除乙方主体' })
  async deletePartyB(@Args('input') input: DeletePartyBInput): Promise<boolean> {
    await this.deletePartyBUsecase.execute({
      partyBId: input.partyBId,
    });

    return true;
  }

  private toPartyBType(item: ListPartyBsUsecaseResult['items'][number]): PartyBType {
    return {
      partyBId: item.partyBId,
      configName: item.configName,
      companyName: item.companyName,
      creditCode: item.creditCode,
      companyAddress: item.companyAddress,
      legalPerson: item.legalPerson,
      contactPerson: item.contactPerson,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      depositoryBank: item.depositoryBank,
      bankAccountNo: item.bankAccountNo,
      hotLine: item.hotLine,
      isDefault: item.isDefault,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
    };
  }
}
