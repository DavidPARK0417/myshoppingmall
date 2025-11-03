"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ShippingAddress } from "@/types/order";

/**
 * @file shipping-address-form.tsx
 * @description 배송지 정보 입력 폼 컴포넌트
 *
 * 주문 페이지에서 배송지 정보를 입력받는 폼입니다.
 * react-hook-form과 zod를 사용하여 유효성 검사를 수행합니다.
 */

const shippingAddressSchema = z.object({
  name: z.string().min(1, "수령인 이름을 입력해주세요."),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .regex(
      /^010-\d{4}-\d{4}$/,
      "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)",
    ),
  postcode: z
    .string()
    .min(1, "우편번호를 입력해주세요.")
    .regex(/^\d{5}$/, "우편번호는 5자리 숫자입니다."),
  address: z.string().min(1, "주소를 입력해주세요."),
  detailAddress: z.string().optional(),
  orderNote: z.string().optional(),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

interface ShippingAddressFormProps {
  onSubmit: (data: ShippingAddressFormData) => void;
  isLoading?: boolean;
}

export default function ShippingAddressForm({
  onSubmit,
  isLoading = false,
}: ShippingAddressFormProps) {
  const form = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      name: "",
      phone: "",
      postcode: "",
      address: "",
      detailAddress: "",
      orderNote: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log("[shipping-address-form] 폼 제출", data);
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form
        id="shipping-address-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* 수령인 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수령인 이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 연락처 */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="010-1234-5678"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                전화번호는 010-1234-5678 형식으로 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 우편번호 */}
        <FormField
          control={form.control}
          name="postcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>우편번호 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345"
                  maxLength={5}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>우편번호는 5자리 숫자입니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 기본 주소 */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>기본 주소 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="서울시 강남구 테헤란로 123"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 상세 주소 */}
        <FormField
          control={form.control}
          name="detailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상세 주소</FormLabel>
              <FormControl>
                <Input
                  placeholder="101동 101호"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>선택 사항입니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주문 메모 */}
        <FormField
          control={form.control}
          name="orderNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주문 메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="배송 시 요청사항을 입력해주세요. (예: 문 앞에 놓아주세요)"
                  rows={4}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>선택 사항입니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
