import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { Public } from '@adapters/api/graphql/decorators/public.decorator';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePartyAUsecase } from '@usecases/power-system/party-a/create-party-a.usecase';
import { DeletePartyAUsecase } from '@usecases/power-system/party-a/delete-party-a.usecase';
import { GetPartyAUsecase } from '@usecases/power-system/party-a/get-party-a.usecase';
import {
  ListPartyAsUsecase,
  type ListPartyAsUsecaseResult,
} from '@usecases/power-system/party-a/list-party-as.usecase';
import { UpdatePartyAUsecase } from '@usecases/power-system/party-a/update-party-a.usecase';
import { CreatePartyAInput } from './dto/create-party-a.input';
import { DeletePartyAInput } from './dto/delete-party-a.input';
import { PartyAInput } from './dto/party-a.input';
import { PartyAsInput } from './dto/party-as.input';
import { PartyAsOutput } from './dto/party-as.output';
import { PartyAType } from './dto/party-a.type';
import { UpdatePartyAInput } from './dto/update-party-a.input';

@Resolver(() => PartyAType)
export class PowerSystemPartyAResolver {
  constructor(
    private readonly createPartyAUsecase: CreatePartyAUsecase,
    private readonly deletePartyAUsecase: DeletePartyAUsecase,
    private readonly listPartyAsUsecase: ListPartyAsUsecase,
    private readonly getPartyAUsecase: GetPartyAUsecase,
    private readonly updatePartyAUsecase: UpdatePartyAUsecase,
  ) {}

  @Public()
  @ValidateInput()
  @Mutation(() => PartyAType, { description: '创建甲方主体' })
  async createPartyA(@Args('input') input: CreatePartyAInput): Promise<PartyAType> {
    const result = await this.createPartyAUsecase.execute({
      companyName: input.companyName,
      creditCode: input.creditCode,
      companyAddress: input.companyAddress,
      legalPerson: input.legalPerson,
      depositoryBank: input.depositoryBank,
      bankAccountNo: input.bankAccountNo,
      contactEmail: input.contactEmail,
      contactPerson: input.contactPerson,
      contactPhone: input.contactPhone,
      powerSupplyInfo: input.powerSupplyInfo,
    });

    return this.toPartyAType(result.partyA);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => PartyAType, { description: '更新甲方主体' })
  async updatePartyA(@Args('input') input: UpdatePartyAInput): Promise<PartyAType> {
    const result = await this.updatePartyAUsecase.execute({
      partyAId: input.partyAId,
      companyName: input.companyName,
      creditCode: input.creditCode,
      companyAddress: input.companyAddress,
      legalPerson: input.legalPerson,
      depositoryBank: input.depositoryBank,
      bankAccountNo: input.bankAccountNo,
      contactEmail: input.contactEmail,
      contactPerson: input.contactPerson,
      contactPhone: input.contactPhone,
      powerSupplyInfo: input.powerSupplyInfo,
    });

    return this.toPartyAType(result.partyA);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => Boolean, { description: '删除甲方主体' })
  async deletePartyA(@Args('input') input: DeletePartyAInput): Promise<boolean> {
    await this.deletePartyAUsecase.execute({
      partyAId: input.partyAId,
    });

    return true;
  }

  @Public()
  @ValidateInput()
  @Query(() => PartyAsOutput, { description: '查询甲方主体列表' })
  async partyAs(@Args('input', { nullable: true }) input?: PartyAsInput): Promise<PartyAsOutput> {
    const result = await this.listPartyAsUsecase.execute({
      companyName: input?.companyName,
      creditCode: input?.creditCode,
    });

    return {
      items: result.items.map((item) => this.toPartyAType(item)),
      total: result.total,
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => PartyAType, { description: '查询单个甲方主体' })
  async partyA(@Args('input') input: PartyAInput): Promise<PartyAType> {
    const result = await this.getPartyAUsecase.execute({
      partyAId: input.partyAId,
    });

    return this.toPartyAType(result);
  }

  private toPartyAType(item: ListPartyAsUsecaseResult['items'][number]): PartyAType {
    return {
      partyAId: item.partyAId,
      companyName: item.companyName,
      creditCode: item.creditCode,
      companyAddress: item.companyAddress,
      legalPerson: item.legalPerson,
      depositoryBank: item.depositoryBank,
      bankAccountNo: item.bankAccountNo,
      contactEmail: item.contactEmail,
      contactPerson: item.contactPerson,
      contactPhone: item.contactPhone,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      powerSupplyInfo: item.powerSupplyInfo.map((powerSupply) => ({
        psId: powerSupply.psId,
        partyAId: powerSupply.partyAId,
        powerSupplyAddress: powerSupply.powerSupplyAddress,
        powerSupplyNumber: powerSupply.powerSupplyNumber,
        createdAt: powerSupply.createdAt,
        updatedAt: powerSupply.updatedAt,
        createdBy: powerSupply.createdBy,
        updatedBy: powerSupply.updatedBy,
      })),
    };
  }
}
